'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, RefreshCw, Loader2, Trash2, Download, Phone, User } from 'lucide-react'

interface Contact {
  id: string
  phoneNumber: string
  jid?: string
  pushName?: string
  name?: string
  tags?: string
  sourceGroupId?: string
  sourceGroup?: {
    id: string
    name: string
  }
  messageCount: number
  createdAt: string
}

export default function ContatosPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 })

  const fetchContacts = async (page = 1) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (filter) params.set('search', filter)
      params.set('page', String(page))
      params.set('limit', '50')

      const res = await fetch(`/api/contacts?${params.toString()}`)
      const data = await res.json()

      if (data.success) {
        setContacts(data.data.contacts || [])
        setPagination(data.data.pagination)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Erro ao carregar contatos')
    } finally {
      setLoading(false)
    }
  }

  const deleteSelected = async () => {
    if (selected.size === 0) return
    if (!confirm(`Excluir ${selected.size} contatos selecionados?`)) return

    try {
      const res = await fetch('/api/contacts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected) }),
      })
      const data = await res.json()

      if (data.success) {
        setSelected(new Set())
        fetchContacts()
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Erro ao excluir')
    }
  }

  const exportCSV = () => {
    if (contacts.length === 0) return

    const contactsToExport = selected.size > 0
      ? contacts.filter(c => selected.has(c.id))
      : contacts

    const headers = ['Telefone', 'Nome', 'PushName', 'Grupo Origem', 'Tags']
    const rows = contactsToExport.map(c => [
      c.phoneNumber,
      c.name || '',
      c.pushName || '',
      c.sourceGroup?.name || '',
      c.tags || '',
    ])

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contatos-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
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
    if (selected.size === contacts.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(contacts.map(c => c.id)))
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contatos</h1>
          <p className="text-muted-foreground">
            Gerencie os contatos extraidos dos grupos
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => fetchContacts()} variant="outline" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Atualizar
          </Button>
          <Button onClick={exportCSV} variant="outline" disabled={contacts.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <Input
              placeholder="Buscar por telefone, nome ou tag..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchContacts()}
              className="flex-1"
            />
            <Button onClick={() => fetchContacts()} variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Buscar
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

      {contacts.length === 0 && !loading && !error && (
        <Card>
          <CardContent className="py-8 text-center">
            <User className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Nenhum contato encontrado</h3>
            <p className="text-muted-foreground">
              Extraia contatos dos grupos conectados para vê-los aqui.
            </p>
          </CardContent>
        </Card>
      )}

      {contacts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lista de Contatos</CardTitle>
                <CardDescription>
                  {pagination.total} contatos no total • Página {pagination.page} de {pagination.totalPages}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  {selected.size === contacts.length ? 'Desmarcar' : 'Selecionar'} Todos
                </Button>
                {selected.size > 0 && (
                  <>
                    <Button variant="outline" size="sm" onClick={exportCSV}>
                      <Download className="mr-2 h-4 w-4" />
                      Exportar {selected.size}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={deleteSelected}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir {selected.size}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`flex items-center gap-4 rounded-lg border p-4 ${
                    selected.has(contact.id) ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(contact.id)}
                    onChange={() => toggleSelect(contact.id)}
                    className="h-4 w-4"
                  />

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {contact.name || contact.pushName || contact.phoneNumber}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      +{contact.phoneNumber}
                      {contact.sourceGroup && ` • ${contact.sourceGroup.name}`}
                    </p>
                  </div>

                  {contact.tags && (
                    <Badge variant="secondary">{contact.tags}</Badge>
                  )}

                  {contact.messageCount > 0 && (
                    <Badge variant="outline">
                      {contact.messageCount} msgs
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {/* Paginação */}
            {pagination.totalPages > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => fetchContacts(pagination.page - 1)}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-4 text-sm">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => fetchContacts(pagination.page + 1)}
                >
                  Próxima
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
