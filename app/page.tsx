'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2, RefreshCw, ChevronLeft, ChevronRight, Edit2, ToggleLeft, ToggleRight, TrendingUp, Calendar, CreditCard, Repeat } from 'lucide-react'
import { Gasto } from '@/lib/supabase'
import { filtrarGastosPorMes, totalMes, formatCurrency, GastoMes, getMesesDisponiveis } from '@/lib/financeiro'
import GastoModal from '@/components/GastoModal'
import { format, parse, addMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Home() {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [loading, setLoading] = useState(true)
  const [mesSelecionado, setMesSelecionado] = useState(() => format(new Date(), 'yyyy-MM'))
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState<Gasto | undefined>()
  const [activeTab, setActiveTab] = useState<'mes' | 'todos'>('mes')

  const fetchGastos = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/gastos')
    const data = await res.json()
    setGastos(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchGastos() }, [fetchGastos])

  const gastosMes = filtrarGastosPorMes(gastos, mesSelecionado)
  const total = totalMes(gastosMes)
  const gastosDia15 = gastosMes.filter(g => g.vencimento_dia === 15)
  const gastosDia25 = gastosMes.filter(g => g.vencimento_dia === 25)
  const totalDia15 = totalMes(gastosDia15)
  const totalDia25 = totalMes(gastosDia25)

  const meses = getMesesDisponiveis(gastos)
  const mesAtual = format(new Date(), 'yyyy-MM')

  function nomeMes(m: string) {
    try {
      return format(parse(m + '-01', 'yyyy-MM-dd', new Date()), "MMMM 'de' yyyy", { locale: ptBR })
    } catch { return m }
  }

  function navMes(dir: number) {
    const d = parse(mesSelecionado + '-01', 'yyyy-MM-dd', new Date())
    setMesSelecionado(format(addMonths(d, dir), 'yyyy-MM'))
  }

  async function handleSave(gasto: Omit<Gasto, 'id' | 'created_at'>) {
    if (editando) {
      await fetch('/api/gastos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editando.id, ...gasto }),
      })
    } else {
      await fetch('/api/gastos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gasto),
      })
    }
    setEditando(undefined)
    await fetchGastos()
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este gasto?')) return
    await fetch('/api/gastos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await fetchGastos()
  }

  async function toggleAtivo(g: Gasto) {
    await fetch('/api/gastos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: g.id, ativo: !g.ativo }),
    })
    await fetchGastos()
  }

  function parcelaBadge(g: GastoMes) {
    if (g.tipo === 'recorrente') return <span className="badge badge-blue"><Repeat size={10} /> recorrente</span>
    return (
      <span className="badge badge-yellow">
        {g.parcela_atual}/{g.parcelas_total}x · até {g.mes_termino ? nomeMesShort(g.mes_termino) : ''}
      </span>
    )
  }

  function nomeMesShort(m: string) {
    try {
      return format(parse(m + '-01', 'yyyy-MM-dd', new Date()), "MMM/yy", { locale: ptBR })
    } catch { return m }
  }

  const recorrentes = gastos.filter(g => g.tipo === 'recorrente')
  const parcelados = gastos.filter(g => g.tipo === 'parcelado')

  return (
    <main style={{ minHeight: '100vh', padding: '24px 16px', maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div className="animate-fade" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--green)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
              controle financeiro
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, lineHeight: 1.1 }}>
              Meus Gastos
            </h1>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => { setEditando(undefined); setShowModal(true) }}
          >
            <Plus size={16} /> Novo gasto
          </button>
        </div>
      </div>

      {/* Navegação de mês */}
      <div className="animate-fade card" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', animationDelay: '0.05s' }}>
        <button className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={() => navMes(-1)}>
          <ChevronLeft size={16} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, textTransform: 'capitalize' }}>
            {nomeMes(mesSelecionado)}
          </p>
          {mesSelecionado === mesAtual && (
            <span className="badge badge-green" style={{ marginTop: 4 }}>mês atual</span>
          )}
        </div>
        <button className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={() => navMes(1)}>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* KPI cards */}
      <div className="animate-fade" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24, animationDelay: '0.1s' }}>
        {[
          { label: 'Total do mês', value: formatCurrency(total), icon: <TrendingUp size={16} />, color: 'var(--green)' },
          { label: 'Dia 15', value: formatCurrency(totalDia15), icon: <Calendar size={16} />, color: 'var(--yellow)' },
          { label: 'Dia 25', value: formatCurrency(totalDia25), icon: <Calendar size={16} />, color: 'var(--blue)' },
        ].map((k) => (
          <div key={k.label} className="card" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ color: k.color, marginBottom: 8, display: 'flex', justifyContent: 'center' }}>{k.icon}</div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 500, color: k.color }}>{k.value}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--bg-card)', padding: 4, borderRadius: 10, border: '1px solid var(--border)' }}>
        {[{ id: 'mes', label: `Este mês (${gastosMes.length})` }, { id: 'todos', label: `Todos os gastos (${gastos.length})` }].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            style={{
              flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-body)',
              background: activeTab === t.id ? 'var(--bg-hover)' : 'transparent',
              color: activeTab === t.id ? 'var(--text)' : 'var(--text-muted)',
              transition: 'all 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Lista de gastos do mês */}
      {activeTab === 'mes' && (
        <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              <RefreshCw size={20} style={{ margin: '0 auto', display: 'block', marginBottom: 8, opacity: 0.5 }} />
              carregando...
            </div>
          ) : gastosMes.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              <CreditCard size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p>Nenhum gasto em {nomeMes(mesSelecionado)}</p>
            </div>
          ) : (
            [15, 25].map(dia => {
              const lista = gastosMes.filter(g => g.vencimento_dia === dia)
              if (!lista.length) return null
              return (
                <div key={dia}>
                  <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, marginTop: 4 }}>
                    vence dia {dia} · {formatCurrency(totalMes(lista))}
                  </p>
                  {lista.map((g, i) => (
                    <div
                      key={g.id}
                      className="card"
                      style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6, animationDelay: `${i * 0.04}s` }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 500, fontSize: 14 }}>{g.nome}</span>
                          {parcelaBadge(g)}
                        </div>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 500, color: 'var(--green)', whiteSpace: 'nowrap' }}>
                        {formatCurrency(g.valor)}
                      </span>
                      <button className="btn btn-ghost" style={{ padding: '6px 8px' }} onClick={() => { setEditando(g); setShowModal(true) }}>
                        <Edit2 size={13} />
                      </button>
                      <button className="btn btn-danger" style={{ padding: '6px 8px' }} onClick={() => handleDelete(g.id)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Todos os gastos */}
      {activeTab === 'todos' && (
        <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'Recorrentes', items: recorrentes, color: 'var(--blue)' },
            { label: 'Parcelados', items: parcelados, color: 'var(--yellow)' },
          ].map(({ label, items, color }) => (
            <div key={label}>
              <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, marginTop: 4 }}>
                {label} ({items.length})
              </p>
              {items.length === 0 && (
                <div className="card" style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>nenhum cadastrado</div>
              )}
              {items.map((g) => (
                <div key={g.id} className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 500, fontSize: 14, color: g.tipo === 'recorrente' && !g.ativo ? 'var(--text-muted)' : 'var(--text)' }}>
                        {g.nome}
                      </span>
                      {g.tipo === 'parcelado' && (
                        <span className="badge badge-yellow">{g.parcelas_total}x · a partir de {nomeMesShort(g.mes_inicio!)}</span>
                      )}
                      {g.tipo === 'recorrente' && (
                        <span className={`badge ${g.ativo ? 'badge-blue' : 'badge-red'}`}>{g.ativo ? 'ativo' : 'inativo'}</span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      dia {g.vencimento_dia} · {formatCurrency(g.valor)}/mês
                    </p>
                  </div>
                  {g.tipo === 'recorrente' && (
                    <button className="btn btn-ghost" style={{ padding: '6px 8px' }} onClick={() => toggleAtivo(g)}>
                      {g.ativo ? <ToggleRight size={18} style={{ color: 'var(--green)' }} /> : <ToggleLeft size={18} />}
                    </button>
                  )}
                  <button className="btn btn-ghost" style={{ padding: '6px 8px' }} onClick={() => { setEditando(g); setShowModal(true) }}>
                    <Edit2 size={13} />
                  </button>
                  <button className="btn btn-danger" style={{ padding: '6px 8px' }} onClick={() => handleDelete(g.id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <GastoModal
          onClose={() => { setShowModal(false); setEditando(undefined) }}
          onSave={handleSave}
          initial={editando}
        />
      )}
    </main>
  )
}
