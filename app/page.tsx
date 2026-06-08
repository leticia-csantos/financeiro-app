'use client'
import { useEffect, useState, useCallback } from 'react'
import {
  Plus, Trash2, RefreshCw, ChevronLeft, ChevronRight, Edit2, ToggleLeft, ToggleRight,
  TrendingUp, Lock, CreditCard, ShoppingCart, Wallet, X,
} from 'lucide-react'
import { Gasto, Ganho, Variavel } from '@/lib/supabase'
import {
  filtrarGastosPorMes, filtrarGanhosPorMes, filtrarVariaveisPorMes,
  totalMes, totalValor, formatCurrency, agruparPorCategoria, percentualComprometido,
  GastoMes, getMesesDisponiveis,
} from '@/lib/financeiro'
import GastoModal from '@/components/GastoModal'
import GanhoModal from '@/components/GanhoModal'
import VariavelModal from '@/components/VariavelModal'
import { format, parse, addMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type NovoMenu = null | 'gasto' | 'ganho' | 'variavel'

export default function Home() {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [ganhos, setGanhos] = useState<Ganho[]>([])
  const [variaveis, setVariaveis] = useState<Variavel[]>([])
  const [loading, setLoading] = useState(true)
  const [mesSelecionado, setMesSelecionado] = useState(() => format(new Date(), 'yyyy-MM'))

  const [novoMenuAberto, setNovoMenuAberto] = useState(false)
  const [modalAberto, setModalAberto] = useState<NovoMenu>(null)
  const [editandoGasto, setEditandoGasto] = useState<Gasto | undefined>()
  const [editandoGanho, setEditandoGanho] = useState<Ganho | undefined>()
  const [editandoVariavel, setEditandoVariavel] = useState<Variavel | undefined>()

  const [verTodasParcelas, setVerTodasParcelas] = useState(false)
  const [gerenciar, setGerenciar] = useState<'ganhos' | 'fixos' | 'variaveis' | null>(null)

  const fetchTudo = useCallback(async () => {
    setLoading(true)
    const [rGastos, rGanhos, rVariaveis] = await Promise.all([
      fetch('/api/gastos'),
      fetch('/api/ganhos'),
      fetch('/api/variaveis'),
    ])
    const [dGastos, dGanhos, dVariaveis] = await Promise.all([rGastos.json(), rGanhos.json(), rVariaveis.json()])
    setGastos(Array.isArray(dGastos) ? dGastos : [])
    setGanhos(Array.isArray(dGanhos) ? dGanhos : [])
    setVariaveis(Array.isArray(dVariaveis) ? dVariaveis : [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchTudo() }, [fetchTudo])

  const gastosMes = filtrarGastosPorMes(gastos, mesSelecionado)
  const fixosMes = gastosMes.filter((g) => g.tipo === 'recorrente')
  const parcelasMes = gastosMes.filter((g) => g.tipo === 'parcelado')
  const ganhosMes = filtrarGanhosPorMes(ganhos, mesSelecionado)
  const variaveisMes = filtrarVariaveisPorMes(variaveis, mesSelecionado)
  const categorias = agruparPorCategoria(variaveisMes)

  const totalGanhos = totalValor(ganhosMes)
  const totalFixos = totalMes(fixosMes)
  const totalParcelas = totalMes(parcelasMes)
  const totalVariaveis = totalValor(variaveisMes)
  const totalSaidas = totalFixos + totalParcelas + totalVariaveis
  const saldo = totalGanhos - totalSaidas
  const percentual = percentualComprometido(totalGanhos, totalSaidas)

  const meses = getMesesDisponiveis(gastos)
  const mesAtual = format(new Date(), 'yyyy-MM')

  function nomeMes(m: string) {
    try {
      return format(parse(m + '-01', 'yyyy-MM-dd', new Date()), "MMMM 'de' yyyy", { locale: ptBR })
    } catch { return m }
  }

  function nomeMesShort(m: string) {
    try {
      return format(parse(m + '-01', 'yyyy-MM-dd', new Date()), 'MMM/yy', { locale: ptBR })
    } catch { return m }
  }

  function navMes(dir: number) {
    const d = parse(mesSelecionado + '-01', 'yyyy-MM-dd', new Date())
    setMesSelecionado(format(addMonths(d, dir), 'yyyy-MM'))
  }

  // ---- Gasto (parcelado/recorrente) ----
  async function handleSaveGasto(gasto: Omit<Gasto, 'id' | 'created_at'>) {
    if (editandoGasto) {
      await fetch('/api/gastos', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editandoGasto.id, ...gasto }) })
    } else {
      await fetch('/api/gastos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(gasto) })
    }
    setEditandoGasto(undefined)
    await fetchTudo()
  }
  async function handleDeleteGasto(id: string) {
    if (!confirm('Remover este gasto?')) return
    await fetch('/api/gastos', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    await fetchTudo()
  }
  async function toggleAtivoGasto(g: Gasto) {
    await fetch('/api/gastos', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: g.id, ativo: !g.ativo }) })
    await fetchTudo()
  }

  // ---- Ganho ----
  async function handleSaveGanho(ganho: Omit<Ganho, 'id' | 'created_at'>) {
    if (editandoGanho) {
      await fetch('/api/ganhos', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editandoGanho.id, ...ganho }) })
    } else {
      await fetch('/api/ganhos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ganho) })
    }
    setEditandoGanho(undefined)
    await fetchTudo()
  }
  async function handleDeleteGanho(id: string) {
    if (!confirm('Remover este ganho?')) return
    await fetch('/api/ganhos', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    await fetchTudo()
  }

  // ---- Variável ----
  async function handleSaveVariavel(variavel: Omit<Variavel, 'id' | 'created_at'>) {
    if (editandoVariavel) {
      await fetch('/api/variaveis', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editandoVariavel.id, ...variavel }) })
    } else {
      await fetch('/api/variaveis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(variavel) })
    }
    setEditandoVariavel(undefined)
    await fetchTudo()
  }
  async function handleDeleteVariavel(id: string) {
    if (!confirm('Remover este lançamento?')) return
    await fetch('/api/variaveis', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    await fetchTudo()
  }

  function abrirNovo(tipo: NovoMenu) {
    setEditandoGasto(undefined)
    setEditandoGanho(undefined)
    setEditandoVariavel(undefined)
    setModalAberto(tipo)
    setNovoMenuAberto(false)
  }

  const parcelasParaExibir = verTodasParcelas
    ? gastos.filter((g) => g.tipo === 'parcelado')
    : parcelasMes

  const kpis = [
    {
      id: 'ganhos' as const,
      label: 'GANHOS',
      value: totalGanhos,
      sub: `${ganhosMes.length} lançamento(s)`,
      color: 'var(--green)',
      icon: <TrendingUp size={18} />,
    },
    {
      id: 'fixos' as const,
      label: 'FIXOS',
      value: totalFixos,
      sub: `${fixosMes.length} item(s) ativo(s)`,
      color: 'var(--red)',
      icon: <Lock size={18} />,
    },
    {
      id: null,
      label: 'PARCELAS',
      value: totalParcelas,
      sub: `${parcelasMes.length} ativa(s) neste mês`,
      color: 'var(--yellow)',
      icon: <CreditCard size={18} />,
    },
    {
      id: 'variaveis' as const,
      label: 'VARIÁVEIS',
      value: totalVariaveis,
      sub: `${variaveisMes.length} lançamento(s)`,
      color: 'var(--blue)',
      icon: <ShoppingCart size={18} />,
    },
  ]

  return (
    <main style={{ minHeight: '100vh', padding: '24px 16px 64px', maxWidth: 760, margin: '0 auto' }}>
      {/* Header */}
      <div className="animate-fade" style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--green)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
            controle financeiro
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, lineHeight: 1.1, display: 'flex', alignItems: 'center', gap: 10 }}>
            Dashboard <span style={{ color: 'var(--red)', fontSize: 18 }}>◆</span>
          </h1>
        </div>

        <div style={{ position: 'relative' }}>
          <button className="btn btn-primary" onClick={() => setNovoMenuAberto((v) => !v)}>
            <Plus size={16} /> Novo lançamento
          </button>
          {novoMenuAberto && (
            <div className="card animate-fade" style={{ position: 'absolute', right: 0, top: '110%', zIndex: 30, width: 200, padding: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { id: 'gasto' as const, label: 'Gasto fixo / parcelado', icon: <CreditCard size={14} /> },
                { id: 'ganho' as const, label: 'Ganho', icon: <TrendingUp size={14} /> },
                { id: 'variavel' as const, label: 'Gasto variável', icon: <ShoppingCart size={14} /> },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => abrirNovo(opt.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 8, border: 'none',
                    background: 'transparent', color: 'var(--text)', fontSize: 13, cursor: 'pointer', textAlign: 'left',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navegação de mês */}
      <div className="animate-fade card" style={{ padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', animationDelay: '0.05s' }}>
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

      {/* Saldo do mês */}
      <div className="animate-fade card" style={{ padding: '32px 20px', marginBottom: 20, textAlign: 'center', animationDelay: '0.08s' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
          saldo do mês
        </p>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 44, color: saldo >= 0 ? 'var(--green)' : 'var(--red)', lineHeight: 1 }}>
          {formatCurrency(saldo)}
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>
          {percentual}% da renda comprometida
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'stretch', gap: 28, marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
              total de entradas
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 500, color: 'var(--green)' }}>
              {formatCurrency(totalGanhos)}
            </p>
          </div>
          <div style={{ width: 1, background: 'var(--border)' }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
              total de gastos
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 500, color: 'var(--red)' }}>
              {formatCurrency(totalSaidas)}
            </p>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="animate-fade" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20, animationDelay: '0.1s' }}>
        {kpis.map((k) => (
          <div
            key={k.label}
            className="card"
            style={{ padding: '18px', cursor: k.id ? 'pointer' : 'default', transition: 'border-color 0.15s' }}
            onClick={() => k.id && setGerenciar(gerenciar === k.id ? null : k.id)}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>{k.label}</p>
              <span style={{ color: k.color }}>{k.icon}</span>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500, color: k.color }}>{formatCurrency(k.value)}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Painel de gestão (Ganhos / Fixos / Variáveis) */}
      {gerenciar && (
        <div className="card animate-fade" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>
              Gerenciar {gerenciar === 'ganhos' ? 'ganhos' : gerenciar === 'fixos' ? 'gastos fixos' : 'gastos variáveis'}
            </h3>
            <button className="btn btn-ghost" style={{ padding: '6px 8px' }} onClick={() => setGerenciar(null)}>
              <X size={14} />
            </button>
          </div>

          {gerenciar === 'ganhos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {ganhos.length === 0 && <EmptyRow texto="Nenhum ganho cadastrado" />}
              {ganhos.map((g) => (
                <div key={g.id} className="card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 500, fontSize: 14 }}>{g.nome}</span>
                      <span className={`badge ${g.recorrente ? 'badge-blue' : 'badge-yellow'}`}>
                        {g.recorrente ? 'recorrente' : `pontual · ${g.mes_referencia ? nomeMesShort(g.mes_referencia) : ''}`}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--green)', whiteSpace: 'nowrap' }}>{formatCurrency(g.valor)}</span>
                  <button className="btn btn-ghost" style={{ padding: '6px 8px' }} onClick={() => { setEditandoGanho(g); setModalAberto('ganho') }}><Edit2 size={13} /></button>
                  <button className="btn btn-danger" style={{ padding: '6px 8px' }} onClick={() => handleDeleteGanho(g.id)}><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          )}

          {gerenciar === 'fixos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {gastos.filter((g) => g.tipo === 'recorrente').length === 0 && <EmptyRow texto="Nenhum gasto fixo cadastrado" />}
              {gastos.filter((g) => g.tipo === 'recorrente').map((g) => (
                <div key={g.id} className="card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 500, fontSize: 14, color: g.ativo ? 'var(--text)' : 'var(--text-muted)' }}>{g.nome}</span>
                      <span className={`badge ${g.ativo ? 'badge-blue' : 'badge-red'}`}>{g.ativo ? 'ativo' : 'inativo'}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>dia {g.vencimento_dia} · {formatCurrency(g.valor)}/mês</p>
                  </div>
                  <button className="btn btn-ghost" style={{ padding: '6px 8px' }} onClick={() => toggleAtivoGasto(g)}>
                    {g.ativo ? <ToggleRight size={18} style={{ color: 'var(--green)' }} /> : <ToggleLeft size={18} />}
                  </button>
                  <button className="btn btn-ghost" style={{ padding: '6px 8px' }} onClick={() => { setEditandoGasto(g); setModalAberto('gasto') }}><Edit2 size={13} /></button>
                  <button className="btn btn-danger" style={{ padding: '6px 8px' }} onClick={() => handleDeleteGasto(g.id)}><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          )}

          {gerenciar === 'variaveis' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {variaveisMes.length === 0 && <EmptyRow texto={`Nenhum gasto variável em ${nomeMes(mesSelecionado)}`} />}
              {variaveisMes.map((v) => (
                <div key={v.id} className="card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 500, fontSize: 14 }}>{v.nome}</span>
                      <span className="badge badge-yellow">{v.categoria}</span>
                    </div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--blue)', whiteSpace: 'nowrap' }}>{formatCurrency(v.valor)}</span>
                  <button className="btn btn-ghost" style={{ padding: '6px 8px' }} onClick={() => { setEditandoVariavel(v); setModalAberto('variavel') }}><Edit2 size={13} /></button>
                  <button className="btn btn-danger" style={{ padding: '6px 8px' }} onClick={() => handleDeleteVariavel(v.id)}><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Gastos por categoria */}
      <div className="animate-fade card" style={{ padding: 20, marginBottom: 20, animationDelay: '0.14s' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16 }}>
          Gastos por <span style={{ color: 'var(--red)' }}>Categoria</span>
        </h3>
        {loading ? (
          <LoadingRow />
        ) : categorias.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '12px 0' }}>
            Nenhum gasto variável lançado
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {categorias.map((c) => (
              <div key={c.categoria} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="badge badge-blue" style={{ minWidth: 90, justifyContent: 'center' }}>{c.categoria}</span>
                <div style={{ flex: 1, height: 6, borderRadius: 4, background: 'var(--bg-hover)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, Math.round((c.total / (totalVariaveis || 1)) * 100))}%`, background: 'var(--blue)', borderRadius: 4 }} />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text)', whiteSpace: 'nowrap' }}>{formatCurrency(c.total)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Parcelas do mês */}
      <div className="animate-fade card" style={{ padding: 20, marginBottom: 20, animationDelay: '0.18s' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>
            Parcelas <span style={{ color: 'var(--red)' }}>do Mês</span>
          </h3>
          <button className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => setVerTodasParcelas((v) => !v)}>
            {verTodasParcelas ? 'Ver deste mês' : 'Ver todas'}
          </button>
        </div>

        {loading ? (
          <LoadingRow />
        ) : parcelasParaExibir.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '12px 0' }}>
            {verTodasParcelas ? 'Nenhuma parcela cadastrada' : `Nenhuma parcela em ${nomeMes(mesSelecionado)}`}
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['NOME', 'PARCELA', 'VALOR', 'VENC.', ''].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.06em', fontWeight: 500 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parcelasParaExibir.map((g) => {
                  const gm = g as GastoMes
                  return (
                    <tr key={g.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px', fontWeight: 500 }}>{g.nome}</td>
                      <td style={{ padding: '10px' }}>
                        <span className="badge badge-yellow">
                          {verTodasParcelas
                            ? `${g.parcelas_total}x`
                            : `${gm.parcela_atual ?? '?'}/${g.parcelas_total}x`}
                        </span>
                      </td>
                      <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>{formatCurrency(g.valor)}</td>
                      <td style={{ padding: '10px', color: 'var(--text-muted)' }}>Dia {g.vencimento_dia}</td>
                      <td style={{ padding: '10px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button className="btn btn-ghost" style={{ padding: '6px 8px' }} onClick={() => { setEditandoGasto(g); setModalAberto('gasto') }}><Edit2 size={13} /></button>
                        <button className="btn btn-danger" style={{ padding: '6px 8px', marginLeft: 4 }} onClick={() => handleDeleteGasto(g.id)}><Trash2 size={13} /></button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modais */}
      {modalAberto === 'gasto' && (
        <GastoModal
          onClose={() => { setModalAberto(null); setEditandoGasto(undefined) }}
          onSave={handleSaveGasto}
          initial={editandoGasto}
        />
      )}
      {modalAberto === 'ganho' && (
        <GanhoModal
          onClose={() => { setModalAberto(null); setEditandoGanho(undefined) }}
          onSave={handleSaveGanho}
          initial={editandoGanho}
          mesAtual={mesSelecionado}
        />
      )}
      {modalAberto === 'variavel' && (
        <VariavelModal
          onClose={() => { setModalAberto(null); setEditandoVariavel(undefined) }}
          onSave={handleSaveVariavel}
          initial={editandoVariavel}
          mesAtual={mesSelecionado}
        />
      )}
    </main>
  )
}

function LoadingRow() {
  return (
    <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
      <RefreshCw size={18} style={{ margin: '0 auto', display: 'block', marginBottom: 8, opacity: 0.5 }} />
      carregando...
    </div>
  )
}

function EmptyRow({ texto }: { texto: string }) {
  return (
    <div className="card" style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
      {texto}
    </div>
  )
}
