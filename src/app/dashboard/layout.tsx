'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/dashboard/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected')
  const [phoneNumber, setPhoneNumber] = useState<string>()

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/evolution/status')
        const data = await res.json()
        if (data.success && data.data?.connected) {
          setConnectionStatus('connected')
        } else {
          setConnectionStatus('disconnected')
        }
      } catch {
        setConnectionStatus('disconnected')
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex min-h-screen">
      <Sidebar connectionStatus={connectionStatus} phoneNumber={phoneNumber} />
      <main className="flex-1 overflow-auto bg-muted/30 p-6">
        {children}
      </main>
    </div>
  )
}
