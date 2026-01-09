'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, RefreshCw, Users, MessageSquare, Loader2, Trash2, LogIn, Download } from 'lucide-react'

interface Group {
  id: string
  name: string
  inviteCode?: string
  inviteUrl?: string
  status: string
  source: string
  participantCount: number
  jid?: string
  tags?: string
  createdAt: string
  _count?: {
    contacts: number
  }
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'secondary',
  JOINING: 'outline',
  JOINED: 'success',
  LEFT: 'secondary',
  FAILED: 'destructive',
  BLOCKED: 'destructive',
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  JOINING: 'Entrando...',
  JOINED: 'Conectado',
  LEFT: 'Saiu',
  FAILED: 'Falhou',
  BLOCKED: 'Bloqueado',
}

export default function GruposPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [joining, setJoining] = useState<string | null>(null)

  const fetchGroups = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (filter) params.set('search', filter)
      if (statusFilter) params.set('status', statusFilter)
      params.set('limit', '100')

      const res = await fetch(`/api/groups?${params.toString()}`)
      const data = await res.json()

      if (data.success) {
        setGroups(data.data.groups || [])
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Erro ao carregar grupos')
    } finally {
      setLoading(false)
    }
  }

  const syncWithWhatsApp = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/evolution/groups')
      const data = await res.json()

      if (data.success) {
        // Save synced groups to database
        const whatsappGroups = data.data || []
        if (whatsappGroups.length > 0) {
          await fetch('/api/groups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              groups: whatsappGroups.map((g: any) => ({
                name: g.subject || g.name,
                jid: g.id,
                source: 'SYNCED',
                status: 'JOINED',
                participantCount: g.size || 0,
              })),
            }),
          })
        }
        fetchGroups()
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Erro ao sincronizar')
    } finally {
      setLoading(false)
    }
  }

  const joinGroup = async (groupId: string) => {
    setJoining(groupId)
    try {
      const res = await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId }),
      })
      const data = await res.json()

      if (data.success) {
        fetchGroups()
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Erro ao entrar no grupo')
    } finally {
      setJoining(null)
    }
  }

  const deleteSelected = async () => {
    if (selected.size === 0) return
    if (!confirm(`Excluir ${selected.size} grupos selecionados?`)) return

    try {
      const res = await fetch('/api/groups', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected) }),
      })
      const data = await res.json()

      if (data.success) {
        setSelected(new Set())
        fetchGroups()
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Erro ao excluir')
    }
  }

  const extractContacts = async (groupId: string) => {
    try {
      const res = await fetch('/api/contacts/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId }),
      })
      const data = await res.json()

      if (data.success) {
        alert(`Extração concluída!\n\nTotal: ${data.data.total}\nNovos: ${data.data.created}\nAtualizados: ${data.data.updated}`)
        fetchGroups()
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Erro ao extrair contatos')
    }
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selected)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelected(newSelected)
  }

  const selectAll = () => {
    if (selected.size === groups.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(groups.map(g => g.id)))
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [statusFilter])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Grupos</h1>
          <p className="text-muted-foreground">
            Gerencie os grupos de WhatsApp
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={syncWithWhatsApp} variant="outline" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Sincronizar WhatsApp
          </Button>
          <Link href="/dashboard/grupos/buscar">
            <Button>
              <Search className="mr-2 h-4 w-4" />
              Buscar Grupos
            </Button>
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <Input
              placeholder="Buscar por nome ou tag..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchGroups()}
              className="flex-1"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            >
              <option value="">Todos os status</option>
              <option value="PENDING">Pendentes</option>
              <option value="JOINED">Conectados</option>
              <option value="FAILED">Falhou</option>
            </select>
            <Button onClick={fetchGroups} variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card>
          <CardContent className="py-4 text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      {groups.length === 0 && !loading && !error && (
        <Card>
          <CardContent className="py-8 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Nenhum grupo encontrado</h3>
            <p className="text-muted-foreground">
              Conecte seu WhatsApp ou busque grupos para começar.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Link href="/dashboard">
                <Button variant="outline">Conectar WhatsApp</Button>
              </Link>
              <Link href="/dashboard/grupos/buscar">
                <Button>Buscar Grupos</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {groups.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Grupos Salvos</CardTitle>
                <CardDescription>
                  {groups.length} grupos no banco de dados
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  {selected.size === groups.length ? 'Desmarcar' : 'Selecionar'} Todos
                </Button>
                {selected.size > 0 && (
                  <Button variant="destructive" size="sm" onClick={deleteSelected}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir {selected.size}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className={`flex items-center gap-4 rounded-lg border p-4 ${
                    selected.has(group.id) ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(group.id)}
                    onChange={() => toggleSelect(group.id)}
                    className="h-4 w-4"
                  />

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{group.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {group.source === 'SCRAPED' ? 'Encontrado na busca' :
                       group.source === 'SYNCED' ? 'Sincronizado do WhatsApp' : 'Manual'}
                      {group.tags && ` • ${group.tags}`}
                    </p>
                  </div>

                  <Badge variant={STATUS_COLORS[group.status] as any}>
                    {STATUS_LABELS[group.status]}
                  </Badge>

                  {group.participantCount > 0 && (
                    <Badge variant="outline">
                      {group.participantCount} membros
                    </Badge>
                  )}

                  <div className="flex gap-1">
                    {group.status === 'PENDING' && group.inviteCode && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => joinGroup(group.id)}
                        disabled={joining === group.id}
                      >
                        {joining === group.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <LogIn className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    {group.status === 'JOINED' && group.jid && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => extractContacts(group.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
