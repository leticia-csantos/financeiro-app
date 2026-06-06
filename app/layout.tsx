import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Financeiro 2025',
  description: 'Controle de gastos e parcelas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
