'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api-client';

interface Stats {
  totalBusinesses: number;
  totalUsers: number;
  totalPlans: number;
  statusCounts: Record<string, number>;
}

interface Business {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  subscription_status: string;
  plan_name: string | null;
  owner_name: string | null;
  owner_email: string | null;
  created_at: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  trial: { label: 'Trial', color: 'var(--color-amber)', bg: 'var(--color-amber-soft)' },
  active: { label: 'Ativo', color: 'var(--color-green)', bg: 'var(--color-green-soft)' },
  paid: { label: 'Pago', color: 'var(--color-green)', bg: 'var(--color-green-soft)' },
  overdue: { label: 'Inadimplente', color: 'var(--color-rose)', bg: 'var(--color-rose-soft)' },
  cancelled: { label: 'Cancelado', color: 'var(--color-text-muted)', bg: 'var(--color-bg-surface)' },
  blocked: { label: 'Bloqueado', color: 'var(--color-rose)', bg: 'var(--color-rose-soft)' },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_MAP[status] || { label: status, color: 'var(--color-text-muted)', bg: 'var(--color-bg-surface)' };
  return (
    <span
      className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider"
      style={{ color: cfg.color, backgroundColor: cfg.bg }}
    >
      {cfg.label}
    </span>
  );
}

function KpiCard({ label, value, iconBg, iconColor, icon }: {
  label: string; value: number | string; iconBg: string; iconColor: string; icon: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--color-bg-surface)] rounded-2xl p-5 flex justify-between items-center hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all">
      <div>
        <p className="text-[11px] text-[var(--color-text-secondary)] font-medium mb-1.5 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-extrabold text-[var(--color-text-primary)] tracking-tight">{value}</p>
      </div>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg }}>
        <svg className="w-5 h-5" style={{ color: iconColor }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          {icon}
        </svg>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentBusinesses, setRecentBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, bizRes, usersRes, plansRes] = await Promise.all([
        api.get('/api/businesses/stats'),
        api.get('/api/businesses', { params: { page: '1', limit: '10' } }),
        api.get('/api/profiles', { params: { page: '1', limit: '1' } }),
        api.get('/api/plans'),
      ]);

      const businesses: Business[] = bizRes.data.data || [];
      const totalBusinesses = statsRes.data.totalBusinesses || 0;
      const totalUsers = usersRes.data.total || 0;
      const totalPlans = (Array.isArray(plansRes.data) ? plansRes.data : []).filter((p: { is_active: boolean }) => p.is_active).length;
      const statusCounts: Record<string, number> = statsRes.data.statusCounts || {};

      setStats({ totalBusinesses, totalUsers, totalPlans, statusCounts });
      setRecentBusinesses(businesses);
    } catch {
      setStats(null);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Hero Panel */}
      <div className="bg-white -mx-7 -mt-6 px-7 pt-4 pb-5 border-b border-[var(--color-border)] shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <h1 className="text-lg font-bold text-[var(--color-text-primary)]">Dashboard</h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Visao geral do sistema</p>
      </div>

      {error && (
        <div className="mt-6 bg-white rounded-2xl border border-[var(--color-border)] p-6">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-sm font-medium text-[var(--color-rose)]">{error}</p>
            <button onClick={fetchData} className="mt-3 px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white text-xs font-semibold hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer">Tentar novamente</button>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <KpiCard
            label="Total de Empresas"
            value={stats?.totalBusinesses || 0}
            iconBg="var(--color-accent-soft)"
            iconColor="var(--color-accent)"
            icon={<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5M3.75 21V7.5l8.25-4.5 8.25 4.5V21" />}
          />
          <KpiCard
            label="Usuarios"
            value={stats?.totalUsers || 0}
            iconBg="var(--color-blue-soft)"
            iconColor="var(--color-blue)"
            icon={<path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />}
          />
          <KpiCard
            label="Planos Ativos"
            value={stats?.totalPlans || 0}
            iconBg="var(--color-green-soft)"
            iconColor="var(--color-green)"
            icon={<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />}
          />
          <KpiCard
            label="Em Trial"
            value={stats?.statusCounts?.trial || 0}
            iconBg="var(--color-amber-soft)"
            iconColor="var(--color-amber)"
            icon={<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />}
          />
        </div>

        {/* Recent Businesses Table */}
        <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Empresas Recentes</h3>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{stats?.totalBusinesses || 0} empresa{(stats?.totalBusinesses || 0) !== 1 ? 's' : ''} cadastrada{(stats?.totalBusinesses || 0) !== 1 ? 's' : ''}</p>
            </div>
            <a
              href="/dashboard/businesses"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white text-xs font-semibold hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              Ver todas
            </a>
          </div>

          {recentBusinesses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-bg-surface)] flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5M3.75 21V7.5l8.25-4.5 8.25 4.5V21" />
                </svg>
              </div>
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">Nenhuma empresa cadastrada</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-[240px]">Empresas aparecerão aqui quando se registrarem pelo dashboard.</p>
            </div>
          ) : (
            <div className="space-y-0 divide-y divide-[var(--color-border-light)]">
              {recentBusinesses.map(biz => (
                <div key={biz.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  {biz.logo_url ? (
                    <img src={biz.logo_url} alt="" className="w-9 h-9 rounded-full object-cover border border-[var(--color-border)]" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7B8AF2] to-[#4F5AE5] flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-bold">{biz.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{biz.name}</p>
                    <p className="text-[11px] text-[var(--color-text-muted)] truncate">{biz.owner_name || biz.slug}</p>
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="text-[11px] text-[var(--color-text-muted)]">{biz.plan_name || '-'}</p>
                  </div>
                  <StatusBadge status={biz.subscription_status} />
                  <p className="text-xs text-[var(--color-text-muted)] hidden md:block">{formatDate(biz.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
