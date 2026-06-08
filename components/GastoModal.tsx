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

const TAGS_SUGERIDAS = ['Supérfluo', 'Estudo', 'Saúde', 'Emocional', 'Espiritual']

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
    tags: initial?.tags ?? [] as string[],
  })
  const [novaTag, setNovaTag] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function toggleTag(tag: string) {
    setForm((f) =>
      f.tags.includes(tag)
        ? { ...f, tags: f.tags.filter((t) => t !== tag) }
        : { ...f, tags: [...f.tags, tag] }
    )
  }

  function adicionarTagPersonalizada() {
    const tag = novaTag.trim()
    if (!tag || form.tags.includes(tag)) return
    setForm((f) => ({ ...f, tags: [...f.tags, tag] }))
    setNovaTag('')
  }

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
        tags: form.tags,
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

          {/* Tags (independentes do tipo) */}
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Tags
            </label>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
              Marque quantas quiser — independem do tipo (ex: parcelado + Estudo)
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              {TAGS_SUGERIDAS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    cursor: 'pointer',
                    background: form.tags.includes(t) ? 'var(--green)' : 'var(--bg)',
                    color: form.tags.includes(t) ? '#0d0f12' : 'var(--text-muted)',
                    border: `1px solid ${form.tags.includes(t) ? 'var(--green)' : 'var(--border)'}`,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="input-base"
                placeholder="ou digite uma tag personalizada"
                value={novaTag}
                onChange={(e) => setNovaTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    adicionarTagPersonalizada()
                  }
                }}
              />
              <button type="button" className="btn btn-ghost" onClick={adicionarTagPersonalizada}>
                <Plus size={14} />
              </button>
            </div>
            {form.tags.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                {form.tags.map((t) => (
                  <span
                    key={t}
                    className="badge badge-green"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => toggleTag(t)}
                      style={{ display: 'flex', background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
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
