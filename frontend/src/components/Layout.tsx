import type { ReactNode } from 'react'
import GlobeBackground from '@/components/GlobeBackground'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="relative min-h-screen bg-[#0b0f1a]">
      <GlobeBackground />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
