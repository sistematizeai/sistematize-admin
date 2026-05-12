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

const emptyForm = {
  name: '', description: '', price_monthly: 0, price_yearly: 0,
  max_collaborators: 1, max_services: 10, max_appointments_month: 100,
};

function formatCurrency(val: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}

const input = 'w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-white text-sm focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)] transition-all';
const label = 'block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5';

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/plans');
      setPlans(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError('Erro ao carregar planos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  function openCreate() {
    setEditingPlan(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(plan: Plan) {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      description: plan.description || '',
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly,
      max_collaborators: plan.max_collaborators,
      max_services: plan.max_services,
      max_appointments_month: plan.max_appointments_month,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      if (editingPlan) {
        await api.put(`/api/plans/${editingPlan.id}`, form);
      } else {
        await api.post('/api/plans', form);
      }
      setModalOpen(false);
      await fetchPlans();
    } catch {
      setError(`Erro ao ${editingPlan ? 'atualizar' : 'criar'} plano.`);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(plan: Plan) {
    try {
      await api.put(`/api/plans/${plan.id}`, { is_active: !plan.is_active });
      await fetchPlans();
    } catch {
      setError('Erro ao alterar status do plano.');
    }
  }

  async function handleDelete(plan: Plan) {
    if (!confirm(`Excluir o plano "${plan.name}"? Essa acao nao pode ser desfeita.`)) return;
    try {
      await api.delete(`/api/plans/${plan.id}`);
      await fetchPlans();
    } catch {
      setError('Erro ao excluir plano.');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="bg-white -mx-7 -mt-6 px-7 pt-4 pb-5 border-b border-[var(--color-border)] shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[var(--color-text-primary)]">Planos</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{plans.length} plano{plans.length !== 1 ? 's' : ''} cadastrado{plans.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openCreate}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] text-white text-sm font-semibold hover:brightness-110 transition-all cursor-pointer flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Plano
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-[var(--color-rose-soft)] border border-[var(--color-rose)]/20 text-sm text-[var(--color-rose)] font-medium">
          {error}
        </div>
      )}

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
              <button onClick={openCreate} className="mt-3 px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white text-xs font-semibold cursor-pointer hover:brightness-110 transition-all">
                Criar Primeiro Plano
              </button>
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
                  <button
                    onClick={() => toggleActive(plan)}
                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all hover:opacity-80"
                    style={{
                      color: plan.is_active ? 'var(--color-green)' : 'var(--color-rose)',
                      backgroundColor: plan.is_active ? 'var(--color-green-soft)' : 'var(--color-rose-soft)',
                    }}
                  >
                    {plan.is_active ? 'Ativo' : 'Inativo'}
                  </button>
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

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--color-border)]">
                  <button
                    onClick={() => openEdit(plan)}
                    className="flex-1 px-3 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] transition-all cursor-pointer"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(plan)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-[var(--color-rose)] hover:bg-[var(--color-rose-soft)] transition-all cursor-pointer"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                {editingPlan ? 'Editar Plano' : 'Novo Plano'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-lg bg-[var(--color-bg-surface)] flex items-center justify-center hover:bg-[var(--color-border)]/30 cursor-pointer transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div>
              <label className={label}>Nome</label>
              <input className={input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Basico" />
            </div>
            <div>
              <label className={label}>Descricao</label>
              <input className={input} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Ex: Para profissionais autonomos" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Preco Mensal (R$)</label>
                <input type="number" step="0.01" className={input} value={form.price_monthly} onChange={e => setForm({ ...form, price_monthly: Number(e.target.value) })} />
              </div>
              <div>
                <label className={label}>Preco Anual (R$)</label>
                <input type="number" step="0.01" className={input} value={form.price_yearly} onChange={e => setForm({ ...form, price_yearly: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={label}>Max. Colaboradores</label>
                <input type="number" className={input} value={form.max_collaborators} onChange={e => setForm({ ...form, max_collaborators: Number(e.target.value) })} />
              </div>
              <div>
                <label className={label}>Max. Servicos</label>
                <input type="number" className={input} value={form.max_services} onChange={e => setForm({ ...form, max_services: Number(e.target.value) })} />
              </div>
              <div>
                <label className={label}>Max. Agend./Mes</label>
                <input type="number" className={input} value={form.max_appointments_month} onChange={e => setForm({ ...form, max_appointments_month: Number(e.target.value) })} />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] transition-all cursor-pointer">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] text-white text-sm font-semibold hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Salvando...' : editingPlan ? 'Atualizar' : 'Criar Plano'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
