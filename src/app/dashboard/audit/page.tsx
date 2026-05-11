'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api-client';

interface AuditLog {
  id: string;
  entity_type: string;
  entity_id: string | null;
  action: string;
  profile_id: string | null;
  business_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  ip_address: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

const ACTION_MAP: Record<string, { label: string; color: string; bg: string }> = {
  create: { label: 'Criar', color: 'var(--color-green)', bg: 'var(--color-green-soft)' },
  update: { label: 'Atualizar', color: 'var(--color-accent)', bg: 'var(--color-accent-soft)' },
  delete: { label: 'Excluir', color: 'var(--color-rose)', bg: 'var(--color-rose-soft)' },
  '2fa_verify': { label: '2FA', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
  login: { label: 'Login', color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)' },
  block: { label: 'Bloquear', color: 'var(--color-rose)', bg: 'var(--color-rose-soft)' },
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const limit = 30;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(limit) };
      if (entityFilter) params.entity_type = entityFilter;
      if (actionFilter) params.action = actionFilter;
      const res = await api.get('/api/audit-logs', { params });
      setLogs(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch {
      setError('Erro ao carregar registros de auditoria.');
    } finally {
      setLoading(false);
    }
  }, [page, entityFilter, actionFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      {/* Hero Panel */}
      <div className="bg-white -mx-7 -mt-6 px-7 pt-4 pb-5 border-b border-[var(--color-border)] shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-[var(--color-text-primary)]">Auditoria</h1>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{total} registro{total !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={entityFilter}
              onChange={e => { setEntityFilter(e.target.value); setPage(1); }}
              className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-white text-xs font-medium text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] cursor-pointer"
            >
              <option value="">Todas entidades</option>
              <option value="business">Empresas</option>
              <option value="plan">Planos</option>
              <option value="profile">Perfis</option>
              <option value="service">Servicos</option>
              <option value="category">Categorias</option>
              <option value="collaborator">Colaboradores</option>
              <option value="client">Clientes</option>
              <option value="appointment">Agendamentos</option>
              <option value="combo">Combos</option>
              <option value="module">Modulos</option>
              <option value="plan_module">Plano-Modulo</option>
              <option value="user_module">Usuario-Modulo</option>
            </select>
            <select
              value={actionFilter}
              onChange={e => { setActionFilter(e.target.value); setPage(1); }}
              className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-white text-xs font-medium text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] cursor-pointer"
            >
              <option value="">Todas acoes</option>
              <option value="create">Criar</option>
              <option value="update">Atualizar</option>
              <option value="delete">Excluir</option>
              <option value="2fa_verify">2FA</option>
              <option value="login">Login</option>
              <option value="block">Bloquear</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="bg-white rounded-2xl border border-[var(--color-border)]">
          {error ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-sm font-medium text-[var(--color-rose)]">{error}</p>
              <button onClick={fetchLogs} className="mt-3 px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white text-xs font-semibold hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer">Tentar novamente</button>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-3 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-bg-surface)] flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">Nenhum registro encontrado</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border-light)]">
              {logs.map(log => {
                const actionCfg = ACTION_MAP[log.action] || { label: log.action, color: 'var(--color-text-muted)', bg: 'var(--color-bg-surface)' };
                return (
                  <div key={log.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-black/[0.015] transition-all">
                    <p className="text-xs text-[var(--color-text-muted)] whitespace-nowrap shrink-0 w-36">{formatDateTime(log.created_at)}</p>
                    <span
                      className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0"
                      style={{ color: actionCfg.color, backgroundColor: actionCfg.bg }}
                    >
                      {actionCfg.label}
                    </span>
                    <p className="text-sm font-medium text-[var(--color-text-primary)] capitalize shrink-0">{log.entity_type}</p>
                    <p className="text-[11px] text-[var(--color-text-muted)] font-mono truncate">{log.entity_id ? log.entity_id.slice(0, 8) + '...' : '-'}</p>
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="px-6 py-3 border-t border-[var(--color-border)] flex items-center justify-between">
              <p className="text-xs text-[var(--color-text-muted)]">Pagina {page} de {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs font-medium rounded-xl border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">Anterior</button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-xs font-medium rounded-xl border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">Proximo</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
