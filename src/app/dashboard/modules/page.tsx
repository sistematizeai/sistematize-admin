'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api-client';

interface Module {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
}

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/modules');
      setModules(res.data || []);
    } catch {
      setError('Erro ao carregar modulos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchModules(); }, [fetchModules]);

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
        <h1 className="text-lg font-bold text-[var(--color-text-primary)]">Modulos</h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{modules.length} modulo{modules.length !== 1 ? 's' : ''} cadastrado{modules.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="mt-6">
        {error ? (
          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-sm font-medium text-[var(--color-rose)]">{error}</p>
              <button onClick={fetchModules} className="mt-3 px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white text-xs font-semibold hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer">Tentar novamente</button>
            </div>
          </div>
        ) : modules.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-bg-surface)] flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0 4.179 2.25-9.75 5.25-9.75-5.25 4.179-2.25" />
                </svg>
              </div>
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">Nenhum modulo cadastrado</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {modules.map(mod => (
              <div key={mod.id} className="bg-white rounded-2xl border border-[var(--color-border)] p-6 hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(139,92,246,0.08)' }}>
                    <svg className="w-5 h-5" style={{ color: '#8b5cf6' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0 4.179 2.25-9.75 5.25-9.75-5.25 4.179-2.25" />
                    </svg>
                  </div>
                  <span
                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      color: mod.is_active ? 'var(--color-green)' : 'var(--color-text-muted)',
                      backgroundColor: mod.is_active ? 'var(--color-green-soft)' : 'var(--color-bg-surface)',
                    }}
                  >
                    {mod.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-1">{mod.name}</h3>
                <p className="text-[11px] text-[var(--color-text-muted)] font-mono mb-2">{mod.slug}</p>
                {mod.description && (
                  <p className="text-xs text-[var(--color-text-secondary)]">{mod.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
