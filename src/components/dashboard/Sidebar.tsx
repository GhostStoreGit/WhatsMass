'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Send,
  FileText,
  Settings,
  Search,
  Smartphone,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/grupos', label: 'Grupos', icon: Users },
  { href: '/dashboard/grupos/buscar', label: 'Buscar Grupos', icon: Search },
  { href: '/dashboard/contatos', label: 'Contatos', icon: MessageSquare },
  { href: '/dashboard/campanhas', label: 'Campanhas', icon: Send },
  { href: '/dashboard/logs', label: 'Logs', icon: FileText },
  { href: '/dashboard/config', label: 'Configuracoes', icon: Settings },
]

interface SidebarProps {
  connectionStatus: 'connected' | 'disconnected' | 'connecting'
  phoneNumber?: string
}

export function Sidebar({ connectionStatus, phoneNumber }: SidebarProps) {
  const pathname = usePathname()

  const statusColors = {
    connected: 'bg-green-500',
    disconnected: 'bg-red-500',
    connecting: 'bg-yellow-500',
  }

  const statusLabels = {
    connected: 'Conectado',
    disconnected: 'Desconectado',
    connecting: 'Conectando...',
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Smartphone className="h-6 w-6 text-primary" />
        <span className="text-lg font-semibold">WA Automation</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
          <div className={cn('h-3 w-3 rounded-full', statusColors[connectionStatus])} />
          <div className="flex-1">
            <p className="text-sm font-medium">{statusLabels[connectionStatus]}</p>
            {phoneNumber && (
              <p className="text-xs text-muted-foreground">{phoneNumber}</p>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
