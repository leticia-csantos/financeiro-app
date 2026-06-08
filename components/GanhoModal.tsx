'use client'
import { useState } from 'react'
import { X } from 'lucide-react'
import { Ganho } from '@/lib/supabase'
import { format } from 'date-fns'

type Props = {
  onClose: () => void
  onSave: (ganho: Omit<Ganho, 'id' | 'created_at'>) => Promise<void>
  initial?: Partial<Ganho>
  mesAtual: string
}

export default function GanhoModal({ onClose, onSave, initial, mesAtual }: Props) {
  const [form, setForm] = useState({
    nome: initial?.nome ?? '',
    valor: initial?.valor?.toString() ?? '',
    recorrente: initial?.recorrente ?? true,
    mes_referencia: initial?.mes_referencia ?? mesAtual,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.nome || !form.valor) {
      setError('Preencha todos os campos obrigatórios.')
      return
    }
    setLoading(true)
    try {
      await onSave({
        nome: form.nome.trim(),
        valor: parseFloat(form.valor.replace(',', '.')),
        recorrente: form.recorrente,
        mes_referencia: form.recorrente ? undefined : form.mes_referencia,
      })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="card animate-slide w-full max-w-md p-6" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>
            {initial ? 'Editar ganho' : 'Novo ganho'}
          </h2>
          <button className="btn btn-ghost" style={{ padding: '6px 8px' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Nome *
            </label>
            <input
              className="input-base"
              placeholder="Ex: Salário, Freelance..."
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Valor (R$) *
            </label>
            <input
              className="input-base"
              placeholder="Ex: 3500.00"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
              inputMode="decimal"
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Tipo *
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { v: true, label: 'Recorrente' },
                { v: false, label: 'Pontual' },
              ].map((t) => (
                <button
                  key={String(t.v)}
                  type="button"
                  onClick={() => setForm({ ...form, recorrente: t.v })}
                  className="btn"
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    background: form.recorrente === t.v ? 'var(--green)' : 'var(--bg)',
                    color: form.recorrente === t.v ? '#0d0f12' : 'var(--text-muted)',
                    border: `1px solid ${form.recorrente === t.v ? 'var(--green)' : 'var(--border)'}`,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {!form.recorrente && (
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Mês de referência *
              </label>
              <input
                className="input-base"
                type="month"
                value={form.mes_referencia}
                onChange={(e) => setForm({ ...form, mes_referencia: e.target.value })}
                style={{ colorScheme: 'dark' }}
              />
            </div>
          )}

          {error && <p style={{ color: 'var(--red)', fontSize: 13 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
