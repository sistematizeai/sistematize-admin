'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api-client';

interface Business {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  cep: string | null;
  cnpj: string | null;
  description: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  booking_enabled: boolean;
  subscription_status: string;
  trial_ends_at: string | null;
  plan_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  owner_name: string | null;
  owner_email: string | null;
  owner_document: string | null;
  owner_document_type: string | null;
  plan_name: string | null;
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
    <span className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider" style={{ color: cfg.color, backgroundColor: cfg.bg }}>
      {cfg.label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDocument(doc: string | null, type: string | null) {
  if (!doc) return '-';
  if (type === 'cnpj' && doc.length === 14) return doc.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  if (doc.length === 11) return doc.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  return doc;
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-[var(--color-border)] last:border-0">
      <span className="text-[11px] font-semibold text-[var(--color-text-muted)] w-28 shrink-0 pt-0.5 uppercase tracking-wide">{label}</span>
      <span className="text-sm text-[var(--color-text-primary)] break-all">{value || '-'}</span>
    </div>
  );
}

function DetailDrawer({ business, onClose }: { business: Business; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
  }, [onClose]);

  const trialDaysLeft = business.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(business.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="fixed inset-0 z-[200]">
      <div className="absolute inset-0 bg-[rgba(15,23,42,0.55)] backdrop-blur-[6px]" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-white shadow-[0_24px_80px_rgba(15,23,42,0.25)] overflow-y-auto animate-slide-in">
        {/* Header */}
        <div className="sticky top-0 bg-white px-7 pt-7 pb-4 border-b border-[rgba(226,232,240,0.8)] z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {business.logo_url ? (
              <img src={business.logo_url} alt="" className="w-10 h-10 rounded-full object-cover border border-[var(--color-border)]" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7B8AF2] to-[#4F5AE5] flex items-center justify-center">
                <span className="text-white text-sm font-bold">{business.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div>
              <h2 className="text-xl font-extrabold text-[var(--color-text-primary)] tracking-tight">{business.name}</h2>
              <p className="text-[11px] text-[var(--color-text-muted)] font-mono">/{business.slug}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-rose-soft)] hover:border-[rgba(239,68,68,0.2)] transition-all cursor-pointer">
            <svg className="w-4 h-4 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-7 py-6 space-y-6">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={business.subscription_status} />
            {business.plan_name && (
              <span className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-accent)', backgroundColor: 'var(--color-accent-soft)' }}>
                {business.plan_name}
              </span>
            )}
            {business.booking_enabled ? (
              <span className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-green)', backgroundColor: 'var(--color-green-soft)' }}>Booking ON</span>
            ) : (
              <span className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg-surface)' }}>Booking OFF</span>
            )}
          </div>

          {/* Trial */}
          {business.subscription_status === 'trial' && trialDaysLeft !== null && (
            <div className="p-3 rounded-xl text-sm flex items-center gap-2" style={{ color: trialDaysLeft <= 2 ? 'var(--color-rose)' : 'var(--color-amber)', backgroundColor: trialDaysLeft <= 2 ? 'var(--color-rose-soft)' : 'var(--color-amber-soft)' }}>
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              {trialDaysLeft === 0 ? 'Trial expira hoje!' : `Trial expira em ${trialDaysLeft} dia${trialDaysLeft !== 1 ? 's' : ''}`}
              <span className="text-xs opacity-70 ml-auto">{formatDate(business.trial_ends_at!)}</span>
            </div>
          )}

          {/* Sections */}
          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
            <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">Proprietario</p>
            <InfoRow label="Nome" value={business.owner_name} />
            <InfoRow label="Email" value={business.owner_email} />
            <InfoRow label="Documento" value={formatDocument(business.owner_document, business.owner_document_type)} />
          </div>

          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
            <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">Contato</p>
            <InfoRow label="Telefone" value={business.phone} />
            <InfoRow label="WhatsApp" value={business.whatsapp} />
            <InfoRow label="Instagram" value={business.instagram} />
            <InfoRow label="Facebook" value={business.facebook} />
            <InfoRow label="TikTok" value={business.tiktok} />
          </div>

          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
            <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">Endereco</p>
            <InfoRow label="Endereco" value={business.address} />
            <InfoRow label="Cidade" value={business.city && business.state ? `${business.city} - ${business.state}` : business.city} />
            <InfoRow label="CEP" value={business.cep} />
            <InfoRow label="CNPJ" value={formatDocument(business.cnpj, 'cnpj')} />
          </div>

          {business.description && (
            <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
              <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">Descricao</p>
              <p className="text-sm text-[var(--color-text-secondary)]">{business.description}</p>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
            <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">Datas</p>
            <InfoRow label="Criado em" value={formatDate(business.created_at)} />
            <InfoRow label="Atualizado" value={formatDate(business.updated_at)} />
            {business.trial_ends_at && <InfoRow label="Trial ate" value={formatDate(business.trial_ends_at)} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Business | null>(null);
  const limit = 20;
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(value); setPage(1); }, 400);
  };

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const fetchBusinesses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(limit) };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/api/businesses', { params });
      setBusinesses(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch {
      setError('Erro ao carregar empresas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => { fetchBusinesses(); }, [fetchBusinesses]);

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      {/* Hero Panel */}
      <div className="bg-white -mx-7 -mt-6 px-7 pt-4 pb-5 border-b border-[var(--color-border)] shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-[var(--color-text-primary)]">Empresas</h1>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{total} empresa{total !== 1 ? 's' : ''} cadastrada{total !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={fetchBusinesses} className="p-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Buscar por nome, slug, owner, email..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)] transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-3 rounded-xl border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)] cursor-pointer"
          >
            <option value="">Todos os status</option>
            <option value="trial">Trial</option>
            <option value="active">Ativo</option>
            <option value="paid">Pago</option>
            <option value="overdue">Inadimplente</option>
            <option value="cancelled">Cancelado</option>
            <option value="blocked">Bloqueado</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[var(--color-border)]">
          {error ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-sm font-medium text-[var(--color-rose)]">{error}</p>
              <button onClick={fetchBusinesses} className="mt-3 px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white text-xs font-semibold hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer">Tentar novamente</button>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-3 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : businesses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-bg-surface)] flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5M3.75 21V7.5l8.25-4.5 8.25 4.5V21" />
                </svg>
              </div>
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">Nenhuma empresa encontrada</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border-light)]">
              {businesses.map(biz => (
                <div
                  key={biz.id}
                  onClick={() => setSelected(biz)}
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-black/[0.015] transition-all cursor-pointer"
                >
                  {biz.logo_url ? (
                    <img src={biz.logo_url} alt="" className="w-9 h-9 rounded-full object-cover border border-[var(--color-border)] shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7B8AF2] to-[#4F5AE5] flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-bold">{biz.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{biz.name}</p>
                    <p className="text-[11px] text-[var(--color-text-muted)] truncate">{biz.owner_name ? `${biz.owner_name} · ${biz.owner_email || ''}` : `/${biz.slug}`}</p>
                  </div>
                  <div className="hidden lg:block text-right shrink-0">
                    {biz.plan_name ? (
                      <span className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-accent)', backgroundColor: 'var(--color-accent-soft)' }}>{biz.plan_name}</span>
                    ) : (
                      <span className="text-[11px] text-[var(--color-text-muted)]">Sem plano</span>
                    )}
                  </div>
                  <div className="hidden md:block text-right shrink-0">
                    <p className="text-[11px] text-[var(--color-text-muted)]">{biz.city && biz.state ? `${biz.city}/${biz.state}` : '-'}</p>
                  </div>
                  <div className="shrink-0"><StatusBadge status={biz.subscription_status} /></div>
                  <p className="text-xs text-[var(--color-text-muted)] hidden xl:block shrink-0">{formatDate(biz.created_at)}</p>
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

      {selected && <DetailDrawer business={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
