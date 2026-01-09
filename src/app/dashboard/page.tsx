'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, MessageSquare, Send, Clock, RefreshCw, QrCode, Smartphone, CheckCircle } from 'lucide-react'

interface ConnectionState {
  connected: boolean
  state: string
  instance?: {
    instanceName: string
    state: string
  }
}

interface QRCodeData {
  qrCode?: string
  pairingCode?: string
}

interface Stats {
  groups: { total: number; joined: number; pending: number }
  contacts: { total: number }
  campaigns: { total: number; active: number }
  queue: { pending: number }
}

export default function DashboardPage() {
  const [status, setStatus] = useState<ConnectionState | null>(null)
  const [qrData, setQrData] = useState<QRCodeData | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/evolution/status')
      const data = await res.json()
      if (data.success) {
        setStatus(data.data)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Erro ao verificar status')
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats')
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas')
    }
  }

  const connectWhatsApp = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/evolution/connect')
      const data = await res.json()
      if (data.success) {
        setQrData(data.data)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Erro ao conectar')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkStatus()
    fetchStats()
    const interval = setInterval(() => {
      checkStatus()
      fetchStats()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Clear QR code when connected
  useEffect(() => {
    if (status?.connected) {
      setQrData(null)
    }
  }, [status?.connected])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Gerencie sua automação de WhatsApp
          </p>
        </div>
        <Button onClick={() => { checkStatus(); fetchStats() }} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Status da Conexão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Status da Conexão
          </CardTitle>
          <CardDescription>
            Conecte seu WhatsApp para começar a usar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant={status?.connected ? 'success' : 'destructive'}>
              {status?.connected ? 'Conectado' : 'Desconectado'}
            </Badge>

            {status?.connected && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                WhatsApp pronto para uso
              </span>
            )}

            {!status?.connected && (
              <Button onClick={connectWhatsApp} disabled={loading}>
                <QrCode className="mr-2 h-4 w-4" />
                {loading ? 'Gerando QR Code...' : 'Conectar WhatsApp'}
              </Button>
            )}
          </div>

          {error && (
            <p className="mt-4 text-sm text-destructive">{error}</p>
          )}

          {qrData?.qrCode && !status?.connected && (
            <div className="mt-6 flex flex-col items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Escaneie o QR Code com seu WhatsApp
              </p>
              <div className="rounded-lg border bg-white p-4">
                <img
                  src={qrData.qrCode}
                  alt="QR Code"
                  className="h-64 w-64"
                />
              </div>
              {qrData.pairingCode && (
                <p className="text-sm">
                  Código de pareamento: <strong>{qrData.pairingCode}</strong>
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/grupos">
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Grupos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.groups.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.groups.joined || 0} conectados • {stats?.groups.pending || 0} pendentes
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/contatos">
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contatos</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.contacts.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                Extraídos dos grupos
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/campanhas">
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campanhas</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.campaigns.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.campaigns.active || 0} ativas
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fila</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.queue.pending || 0}</div>
            <p className="text-xs text-muted-foreground">
              Itens pendentes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Comece a usar o sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/grupos/buscar">
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Buscar Grupos
              </Button>
            </Link>
            <Link href="/dashboard/grupos">
              <Button variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Sincronizar Grupos
              </Button>
            </Link>
            <Link href="/dashboard/campanhas">
              <Button variant="outline">
                <Send className="mr-2 h-4 w-4" />
                Criar Campanha
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
