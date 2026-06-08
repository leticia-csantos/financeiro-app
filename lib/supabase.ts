import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

export function getSupabase() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    _supabase = createClient(url, key)
  }
  return _supabase
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as any)[prop]
  },
})

export type Gasto = {
  id: string
  nome: string
  tipo: 'parcelado' | 'recorrente'
  valor: number
  vencimento_dia: number
  // parcelado
  parcelas_total?: number
  mes_inicio?: string // 'YYYY-MM'
  // recorrente
  ativo: boolean
  // tags transversais (ex: 'Estudo', 'Saúde'), independentes do tipo
  tags?: string[]
  created_at: string
}

export type Ganho = {
  id: string
  nome: string
  valor: number
  recorrente: boolean
  mes_referencia?: string // 'YYYY-MM', usado quando não é recorrente
  created_at: string
}

export type Variavel = {
  id: string
  nome: string
  valor: number
  categoria: string
  mes_referencia: string // 'YYYY-MM'
  created_at: string
}
