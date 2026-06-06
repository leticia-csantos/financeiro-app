'use client'
import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { Gasto } from '@/lib/supabase'
import { format } from 'date-fns'

type Props = {
  onClose: () => void
  onSave: (gasto: Omit<Gasto, 'id' | 'created_at'>) => Promise<void>
  initial?: Partial<Gasto>
}

export default function GastoModal({ onClose, onSave, initial }: Props) {
  const hoje = format(new Date(), 'yyyy-MM')
  const [form, setForm] = useState({
    nome: initial?.nome ?? '',
    tipo: initial?.tipo ?? 'parcelado' as 'parcelado' | 'recorrente',
    valor: initial?.valor?.toString() ?? '',
    vencimento_dia: initial?.vencimento_dia?.toString() ?? '15',
    parcelas_total: initial?.parcelas_total?.toString() ?? '1',
    mes_inicio: initial?.mes_inicio ?? hoje,
    ativo: initial?.ativo ?? true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.nome || !form.valor || !form.vencimento_dia) {
      setError('Preencha todos os campos obrigatórios.')
      return
    }
    setLoading(true)
    try {
      await onSave({
        nome: form.nome.trim(),
        tipo: form.tipo,
        valor: parseFloat(form.valor.replace(',', '.')),
        vencimento_dia: parseInt(form.vencimento_dia),
        parcelas_total: form.tipo === 'parcelado' ? parseInt(form.parcelas_total) : undefined,
        mes_inicio: form.tipo === 'parcelado' ? form.mes_inicio : undefined,
        ativo: form.ativo,
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
            {initial ? 'Editar gasto' : 'Novo gasto'}
          </h2>
          <button className="btn btn-ghost" style={{ padding: '6px 8px' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Nome */}
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Nome *
            </label>
            <input
              className="input-base"
              placeholder="Ex: Dafiti, Vivo, Netflix..."
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
          </div>

          {/* Tipo */}
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Tipo *
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['parcelado', 'recorrente'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, tipo: t })}
                  className="btn"
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    background: form.tipo === t ? 'var(--green)' : 'var(--bg)',
                    color: form.tipo === t ? '#0d0f12' : 'var(--text-muted)',
                    border: `1px solid ${form.tipo === t ? 'var(--green)' : 'var(--border)'}`,
                    textTransform: 'capitalize',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Valor */}
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Valor por {form.tipo === 'parcelado' ? 'parcela' : 'mês'} (R$) *
            </label>
            <input
              className="input-base"
              placeholder="Ex: 102.22"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
              inputMode="decimal"
            />
          </div>

          {/* Vencimento dia */}
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Vencimento (dia do mês) *
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[5, 10, 15, 20, 25].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setForm({ ...form, vencimento_dia: d.toString() })}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    background: form.vencimento_dia === d.toString() ? 'var(--green)' : 'var(--bg)',
                    color: form.vencimento_dia === d.toString() ? '#0d0f12' : 'var(--text-muted)',
                    border: `1px solid ${form.vencimento_dia === d.toString() ? 'var(--green)' : 'var(--border)'}`,
                  }}
                >
                  {d}
                </button>
              ))}
              <input
                className="input-base"
                style={{ flex: 1, textAlign: 'center' }}
                placeholder="outro"
                value={![5,10,15,20,25].includes(parseInt(form.vencimento_dia)) ? form.vencimento_dia : ''}
                onChange={(e) => setForm({ ...form, vencimento_dia: e.target.value })}
                inputMode="numeric"
              />
            </div>
          </div>

          {/* Parcelado fields */}
          {form.tipo === 'parcelado' && (
            <>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Número de parcelas *
                </label>
                <input
                  className="input-base"
                  placeholder="Ex: 10"
                  value={form.parcelas_total}
                  onChange={(e) => setForm({ ...form, parcelas_total: e.target.value })}
                  inputMode="numeric"
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Mês de início *
                </label>
                <input
                  className="input-base"
                  type="month"
                  value={form.mes_inicio}
                  onChange={(e) => setForm({ ...form, mes_inicio: e.target.value })}
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </>
          )}

          {error && (
            <p style={{ color: 'var(--red)', fontSize: 13 }}>{error}</p>
          )}

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
