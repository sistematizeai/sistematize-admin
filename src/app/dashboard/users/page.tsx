'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api-client';

interface Profile {
  id: string;
  full_name: string;
  email: string | null;
  document: string | null;
  document_type: string | null;
  role: string;
  business_id: string | null;
  is_active: boolean;
  created_at: string;
}

function formatDocument(doc: string | null, type: string | null) {
  if (!doc) return '-';
  if (type === 'cnpj' && doc.length === 14) return doc.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  if (doc.length === 11) return doc.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  return doc;
}

const ROLE_MAP: Record<string, { label: string; color: string; bg: string }> = {
  master_admin: { label: 'Master Admin', color: 'var(--color-accent)', bg: 'var(--color-accent-soft)' },
  sub_admin: { label: 'Sub Admin', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
  owner: { label: 'Owner', color: 'var(--color-green)', bg: 'var(--color-green-soft)' },
  collaborator: { label: 'Colaborador', color: 'var(--color-text-secondary)', bg: 'var(--color-bg-surface)' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function UsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const limit = 20;

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/profiles', { params: { page: String(page), limit: String(limit) } });
      setProfiles(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch {
      setError('Erro ao carregar usuarios. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      {/* Hero Panel */}
      <div className="bg-white -mx-7 -mt-6 px-7 pt-4 pb-5 border-b border-[var(--color-border)] shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <h1 className="text-lg font-bold text-[var(--color-text-primary)]">Usuarios</h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{total} usuario{total !== 1 ? 's' : ''} cadastrado{total !== 1 ? 's' : ''}</p>
      </div>

      <div className="mt-6">
        <div className="bg-white rounded-2xl border border-[var(--color-border)]">
          {error ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-sm font-medium text-[var(--color-rose)]">{error}</p>
              <button onClick={fetchProfiles} className="mt-3 px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white text-xs font-semibold hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer">Tentar novamente</button>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-3 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : profiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-bg-surface)] flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">Nenhum usuario encontrado</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border-light)]">
              {profiles.map(p => (
                <div key={p.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-black/[0.015] transition-all">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7B8AF2] to-[#4F5AE5] flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">{p.full_name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{p.full_name}</p>
                    {p.email && <p className="text-[11px] text-[var(--color-text-muted)] truncate">{p.email}</p>}
                    <p className="text-[11px] text-[var(--color-text-muted)] font-mono truncate">{formatDocument(p.document, p.document_type)}</p>
                  </div>
                  <span
                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0"
                    style={{
                      color: (ROLE_MAP[p.role] || ROLE_MAP.collaborator).color,
                      backgroundColor: (ROLE_MAP[p.role] || ROLE_MAP.collaborator).bg,
                    }}
                  >
                    {(ROLE_MAP[p.role] || { label: p.role }).label}
                  </span>
                  <span
                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0"
                    style={{
                      color: p.is_active ? 'var(--color-green)' : 'var(--color-rose)',
                      backgroundColor: p.is_active ? 'var(--color-green-soft)' : 'var(--color-rose-soft)',
                    }}
                  >
                    {p.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                  <p className="text-xs text-[var(--color-text-muted)] hidden md:block shrink-0">{formatDate(p.created_at)}</p>
                </div>
              ))}
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
