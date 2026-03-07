import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FinAcct360 Knowledge Base',
  description: 'Internal documentation and training platform for FinAcct360 accounting team',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
        />
      </head>
      <body className="antialiased min-h-screen bg-slate-900 text-slate-200 font-sans text-base leading-relaxed">{children}</body>
    </html>
  )
}
