'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api-client';

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  max_collaborators: number;
  max_services: number;
  max_appointments_month: number;
  is_active: boolean;
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/plans');
      setPlans(res.data || []);
    } catch {
      setError('Erro ao carregar planos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

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
        <h1 className="text-lg font-bold text-[var(--color-text-primary)]">Planos</h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{plans.length} plano{plans.length !== 1 ? 's' : ''} cadastrado{plans.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="mt-6">
        {plans.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-bg-surface)] flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">Nenhum plano cadastrado</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {plans.map(plan => (
              <div key={plan.id} className="bg-white rounded-2xl border border-[var(--color-border)] p-6 flex flex-col hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-[15px] font-bold text-[var(--color-text-primary)]">{plan.name}</h3>
                    {plan.description && (
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{plan.description}</p>
                    )}
                  </div>
                  <span className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider" style={{
                    color: plan.is_active ? 'var(--color-green)' : 'var(--color-rose)',
                    backgroundColor: plan.is_active ? 'var(--color-green-soft)' : 'var(--color-rose-soft)',
                  }}>
                    {plan.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <div className="space-y-1 mb-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-[var(--color-text-primary)] tracking-tight">{formatCurrency(plan.price_monthly)}</span>
                    <span className="text-xs text-[var(--color-text-muted)]">/mes</span>
                  </div>
                  <p className="text-[11px] text-[var(--color-text-secondary)]">{formatCurrency(plan.price_yearly)}/ano</p>
                </div>

                <div className="border-t border-[var(--color-border)] pt-4 space-y-2.5 flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    <span className="text-[var(--color-text-secondary)]">Ate <strong className="text-[var(--color-text-primary)]">{plan.max_collaborators}</strong> colaboradores</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    <span className="text-[var(--color-text-secondary)]">Ate <strong className="text-[var(--color-text-primary)]">{plan.max_services}</strong> servicos</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    <span className="text-[var(--color-text-secondary)]">Ate <strong className="text-[var(--color-text-primary)]">{plan.max_appointments_month}</strong> agendamentos/mes</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
