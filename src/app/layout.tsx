import type { Metadata } from 'next'
import './globals.css'
import { GlobalCanvas } from '@/lib/canvas/GlobalCanvas'
import { Cursor } from '@/components/ui/Cursor'
import { NavBar } from '@/components/ui/NavBar'
import { PointerProvider } from '@/components/ui/PointerProvider'

export const metadata: Metadata = {
  title: {
    default: 'ARKHEVARA — Digital Systems Atelier',
    template: '%s | ARKHEVARA',
  },
  description:
    'ARKHEVARA is a digital systems atelier specialising in web architectures, autonomous systems, and AI/compute pipelines. Every frame you observe is a live execution of our craft.',
  keywords: ['web development', 'AI systems', 'autonomous agents', 'WebGPU', 'real-time graphics'],
  openGraph: {
    title: 'ARKHEVARA — Digital Systems Atelier',
    description: 'The page you are reading is the living system.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {/* ── Persistent 3D canvas — never unmounts ── */}
        <GlobalCanvas />

        {/* ── Global pointer tracking — fixes cursor on all routes ── */}
        <PointerProvider />

        {/* ── Custom cursor ── */}
        <Cursor />

        {/* ── Navigation ── */}
        <NavBar />

        {/* ── DOM route content ── */}
        <div id="arkhevara-dom">
          {children}
        </div>
      </body>
    </html>
  )
}
