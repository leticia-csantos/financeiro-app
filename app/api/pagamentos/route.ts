import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('pagamentos')
      .select('*')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro inesperado' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { gasto_id, mes_referencia, pago } = await req.json()
    const { data, error } = await supabase
      .from('pagamentos')
      .upsert({ gasto_id, mes_referencia, pago }, { onConflict: 'gasto_id,mes_referencia' })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro inesperado' }, { status: 500 })
  }
}
