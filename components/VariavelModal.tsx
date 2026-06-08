'use client'
import { useState } from 'react'
import { X } from 'lucide-react'
import { Variavel } from '@/lib/supabase'

type Props = {
  onClose: () => void
  onSave: (variavel: Omit<Variavel, 'id' | 'created_at'>) => Promise<void>
  initial?: Partial<Variavel>
  mesAtual: string
}

const CATEGORIAS_SUGERIDAS = ['Supérfluo', 'Estudo', 'Saúde', 'Emocional', 'Espiritual', 'Outros']

export default function VariavelModal({ onClose, onSave, initial, mesAtual }: Props) {
  const [form, setForm] = useState({
    nome: initial?.nome ?? '',
    valor: initial?.valor?.toString() ?? '',
    categoria: initial?.categoria ?? CATEGORIAS_SUGERIDAS[0],
    mes_referencia: initial?.mes_referencia ?? mesAtual,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.nome || !form.valor || !form.categoria) {
      setError('Preencha todos os campos obrigatórios.')
      return
    }
    setLoading(true)
    try {
      await onSave({
        nome: form.nome.trim(),
        valor: parseFloat(form.valor.replace(',', '.')),
        categoria: form.categoria.trim(),
        mes_referencia: form.mes_referencia,
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
            {initial ? 'Editar gasto variável' : 'Novo gasto variável'}
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
              placeholder="Ex: Mercado, Uber, Cinema..."
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
              placeholder="Ex: 89.90"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
              inputMode="decimal"
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Categoria *
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              {CATEGORIAS_SUGERIDAS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, categoria: c })}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    cursor: 'pointer',
                    background: form.categoria === c ? 'var(--green)' : 'var(--bg)',
                    color: form.categoria === c ? '#0d0f12' : 'var(--text-muted)',
                    border: `1px solid ${form.categoria === c ? 'var(--green)' : 'var(--border)'}`,
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
            <input
              className="input-base"
              placeholder="ou digite uma categoria personalizada"
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            />
          </div>

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
