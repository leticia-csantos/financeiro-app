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
  created_at: string
}
