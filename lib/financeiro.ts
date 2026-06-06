import { Gasto } from './supabase'
import { addMonths, parse, format, isAfter, isBefore, startOfMonth } from 'date-fns'

export type GastoMes = Gasto & {
  parcela_atual?: number
  mes_termino?: string
  aplicavel: boolean
}

/**
 * Dado um mês no formato 'YYYY-MM', retorna quais gastos são aplicáveis
 */
export function filtrarGastosPorMes(gastos: Gasto[], mesAno: string): GastoMes[] {
  const mesRef = parse(mesAno + '-01', 'yyyy-MM-dd', new Date())

  return gastos
    .map((g): GastoMes => {
      if (g.tipo === 'recorrente') {
        return { ...g, aplicavel: g.ativo }
      }

      // parcelado
      const inicio = parse(g.mes_inicio! + '-01', 'yyyy-MM-dd', new Date())
      const termino = addMonths(inicio, g.parcelas_total! - 1)
      const mesTerminoStr = format(termino, 'yyyy-MM')

      const aplicavel =
        !isBefore(mesRef, startOfMonth(inicio)) &&
        !isAfter(mesRef, startOfMonth(termino))

      const parcelaAtual = aplicavel
        ? Math.round(
            (mesRef.getFullYear() - inicio.getFullYear()) * 12 +
              mesRef.getMonth() -
              inicio.getMonth() +
              1
          )
        : undefined

      return {
        ...g,
        aplicavel,
        parcela_atual: parcelaAtual,
        mes_termino: mesTerminoStr,
      }
    })
    .filter((g) => g.aplicavel)
}

export function totalMes(gastos: GastoMes[]): number {
  return gastos.reduce((acc, g) => acc + g.valor, 0)
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function getMesesDisponiveis(gastos: Gasto[]): string[] {
  const hoje = new Date()
  const meses = new Set<string>()

  // Adiciona os próximos 12 meses sempre
  for (let i = -2; i <= 12; i++) {
    meses.add(format(addMonths(hoje, i), 'yyyy-MM'))
  }

  // Adiciona meses de início das parcelas
  gastos.forEach((g) => {
    if (g.mes_inicio) {
      const inicio = parse(g.mes_inicio + '-01', 'yyyy-MM-dd', new Date())
      const termino = addMonths(inicio, (g.parcelas_total || 1) - 1)
      for (let i = 0; i <= g.parcelas_total!; i++) {
        meses.add(format(addMonths(inicio, i), 'yyyy-MM'))
      }
      meses.add(format(termino, 'yyyy-MM'))
    }
  })

  return Array.from(meses).sort()
}
