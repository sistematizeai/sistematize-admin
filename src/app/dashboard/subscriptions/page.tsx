'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api-client';

interface Subscription {
  id: string;
  business_id: string;
  billing_cycle: string;
  value: number;
  status: string;
  next_due_date: string | null;
  started_at: string;
  cancelled_at: string | null;
  plan: { id: string; name: string; price_monthly: number; price_yearly: number } | null;
  business: { id: string; name: string; slug: string } | null;
}

interface Stats {
  received_month: number;
  pending_total: number;
  overdue_total: number;
  mrr: number;
  active_subscriptions: number;
  pending_count: number;
  overdue_count: number;
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-[var(--color-green-soft)] text-[var(--color-green)]',
    overdue: 'bg-[var(--color-rose-soft)] text-[var(--color-rose)]',
    cancelled: 'bg-gray-100 text-gray-500',
    expired: 'bg-gray-100 text-gray-500',
  };
  const labels: Record<string, string> = {
    active: 'Ativa', overdue: 'Atrasada', cancelled: 'Cancelada', expired: 'Expirada',
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${styles[status] || 'bg-gray-100 text-gray-500'}`}>
      {labels[status] || status}
    </span>
  );
}

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (statusFilter) params.append('status', statusFilter);

      const [subsRes, statsRes] = await Promise.all([
        api.get(`/api/admin/subscriptions?${params}`),
        api.get('/api/admin/subscriptions/stats'),
      ]);
      setSubs(subsRes.data.data || []);
      setTotal(subsRes.data.total || 0);
      setStats(statsRes.data);
    } catch {
      setError('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalPages = Math.ceil(total / 20);

  return (
    <>
      {/* Header */}
      <div className="bg-white -mx-7 -mt-6 px-7 pt-4 pb-5 border-b border-[var(--color-border)] shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <h1 className="text-lg font-bold text-[var(--color-text-primary)]">Assinaturas</h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Monitoramento de assinaturas e receita da plataforma</p>
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-[var(--color-rose-soft)] border border-[var(--color-rose)]/20 text-sm text-[var(--color-rose)] font-medium">
          {error}
        </div>
      )}

      {/* KPIs */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
            <p className="text-xs text-[var(--color-text-muted)] font-medium">MRR</p>
            <p className="text-2xl font-extrabold text-[var(--color-text-primary)] mt-1">{formatCurrency(stats.mrr)}</p>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{stats.active_subscriptions} assinatura{stats.active_subscriptions !== 1 ? 's' : ''} ativa{stats.active_subscriptions !== 1 ? 's' : ''}</p>
          </div>
          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
            <p className="text-xs text-[var(--color-text-muted)] font-medium">Recebido no Mes</p>
            <p className="text-2xl font-extrabold text-[var(--color-green)] mt-1">{formatCurrency(stats.received_month)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
            <p className="text-xs text-[var(--color-text-muted)] font-medium">Pendente</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">{formatCurrency(stats.pending_total)}</p>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{stats.pending_count} fatura{stats.pending_count !== 1 ? 's' : ''}</p>
          </div>
          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
            <p className="text-xs text-[var(--color-text-muted)] font-medium">Atrasado</p>
            <p className="text-2xl font-extrabold text-[var(--color-rose)] mt-1">{formatCurrency(stats.overdue_total)}</p>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{stats.overdue_count} fatura{stats.overdue_count !== 1 ? 's' : ''}</p>
          </div>
        </div>
      )}

      {/* Filters + Table */}
      <div className="bg-white rounded-2xl border border-[var(--color-border)] mt-6">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-border)]">
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">Todas as Assinaturas</span>
          <span className="text-xs text-[var(--color-text-muted)]">({total})</span>
          <div className="ml-auto">
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-accent)]"
            >
              <option value="">Todos os status</option>
              <option value="active">Ativa</option>
              <option value="overdue">Atrasada</option>
              <option value="cancelled">Cancelada</option>
              <option value="expired">Expirada</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : subs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-[var(--color-text-muted)]">Nenhuma assinatura encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border)]">
                  <th className="px-5 py-3 font-semibold">Empresa</th>
                  <th className="px-5 py-3 font-semibold">Plano</th>
                  <th className="px-5 py-3 font-semibold">Ciclo</th>
                  <th className="px-5 py-3 font-semibold">Valor</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Inicio</th>
                  <th className="px-5 py-3 font-semibold">Prox. Cobranca</th>
                </tr>
              </thead>
              <tbody>
                {subs.map(sub => (
                  <tr key={sub.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-surface)]/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-[var(--color-text-primary)]">{sub.business?.name || '—'}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">{sub.business?.slug}</p>
                    </td>
                    <td className="px-5 py-3.5 font-medium">{sub.plan?.name || '—'}</td>
                    <td className="px-5 py-3.5 text-[var(--color-text-secondary)]">
                      {sub.billing_cycle === 'yearly' ? 'Anual' : 'Mensal'}
                    </td>
                    <td className="px-5 py-3.5 font-bold">{formatCurrency(sub.value)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={sub.status} /></td>
                    <td className="px-5 py-3.5 text-[var(--color-text-muted)]">
                      {new Date(sub.started_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-5 py-3.5 text-[var(--color-text-muted)]">
                      {sub.next_due_date ? new Date(sub.next_due_date).toLocaleDateString('pt-BR') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-text-muted)]">Pagina {page} de {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-medium disabled:opacity-40 cursor-pointer hover:bg-[var(--color-bg-surface)] transition-all"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-medium disabled:opacity-40 cursor-pointer hover:bg-[var(--color-bg-surface)] transition-all"
              >
                Proximo
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
