'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Send, Plus, Loader2, Play, Pause, Square, Trash2, RefreshCw, X } from 'lucide-react'

interface Campaign {
  id: string
  name: string
  description?: string
  type: string
  messageText?: string
  status: string
  totalTargets: number
  sentCount: number
  failedCount: number
  createdAt: string
  startedAt?: string
  _count?: {
    groups: number
    contacts: number
  }
}

interface Group {
  id: string
  name: string
  status: string
  participantCount: number
}

interface Contact {
  id: string
  phoneNumber: string
  pushName?: string
  name?: string
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'secondary',
  SCHEDULED: 'outline',
  RUNNING: 'success',
  PAUSED: 'warning',
  COMPLETED: 'default',
  CANCELLED: 'secondary',
  FAILED: 'destructive',
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Rascunho',
  SCHEDULED: 'Agendada',
  RUNNING: 'Em execução',
  PAUSED: 'Pausada',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
  FAILED: 'Falhou',
}

const TYPE_LABELS: Record<string, string> = {
  GROUP_MESSAGE: 'Mensagem para Grupos',
  CONTACT_MESSAGE: 'Mensagem para Contatos',
  GROUP_JOIN: 'Entrar em Grupos',
}

export default function CampanhasPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)

  // Form state
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState('GROUP_MESSAGE')
  const [formMessage, setFormMessage] = useState('')
  const [formDescription, setFormDescription] = useState('')

  // Target selection
  const [groups, setGroups] = useState<Group[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set())
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set())

  const fetchCampaigns = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/campaigns')
      const data = await res.json()

      if (data.success) {
        setCampaigns(data.data.campaigns || [])
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Erro ao carregar campanhas')
    } finally {
      setLoading(false)
    }
  }

  const fetchTargets = async () => {
    try {
      const [groupsRes, contactsRes] = await Promise.all([
        fetch('/api/groups?status=JOINED&limit=100'),
        fetch('/api/contacts?limit=100'),
      ])

      const [groupsData, contactsData] = await Promise.all([
        groupsRes.json(),
        contactsRes.json(),
      ])

      if (groupsData.success) {
        setGroups(groupsData.data.groups || [])
      }
      if (contactsData.success) {
        setContacts(contactsData.data.contacts || [])
      }
    } catch (err) {
      console.error('Erro ao carregar alvos', err)
    }
  }

  const createCampaign = async () => {
    if (!formName.trim() || !formMessage.trim()) {
      setError('Nome e mensagem são obrigatórios')
      return
    }

    setCreating(true)
    setError(null)

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          type: formType,
          messageText: formMessage,
          description: formDescription,
          groupIds: Array.from(selectedGroups),
          contactIds: Array.from(selectedContacts),
        }),
      })
      const data = await res.json()

      if (data.success) {
        setShowCreate(false)
        resetForm()
        fetchCampaigns()
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Erro ao criar campanha')
    } finally {
      setCreating(false)
    }
  }

  const controlCampaign = async (id: string, action: 'start' | 'pause' | 'stop') => {
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()

      if (data.success) {
        fetchCampaigns()
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Erro ao controlar campanha')
    }
  }

  const deleteCampaign = async (id: string) => {
    if (!confirm('Excluir esta campanha?')) return

    try {
      const res = await fetch('/api/campaigns', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()

      if (data.success) {
        fetchCampaigns()
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Erro ao excluir campanha')
    }
  }

  const resetForm = () => {
    setFormName('')
    setFormType('GROUP_MESSAGE')
    setFormMessage('')
    setFormDescription('')
    setSelectedGroups(new Set())
    setSelectedContacts(new Set())
  }

  const openCreateForm = () => {
    setShowCreate(true)
    fetchTargets()
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campanhas</h1>
          <p className="text-muted-foreground">
            Crie e gerencie campanhas de disparo
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchCampaigns} variant="outline" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Atualizar
          </Button>
          <Button onClick={openCreateForm}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Campanha
          </Button>
        </div>
      </div>

      {error && (
        <Card>
          <CardContent className="py-4 text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Modal de Criação */}
      {showCreate && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Nova Campanha</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome da Campanha</Label>
                <Input
                  placeholder="Ex: Promoção de Janeiro"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                >
                  <option value="GROUP_MESSAGE">Mensagem para Grupos</option>
                  <option value="CONTACT_MESSAGE">Mensagem para Contatos</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Input
                placeholder="Descrição da campanha..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea
                placeholder="Digite a mensagem que será enviada..."
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Você pode usar variáveis como {'{nome}'} para personalizar
              </p>
            </div>

            {/* Seleção de Alvos */}
            {formType === 'GROUP_MESSAGE' && groups.length > 0 && (
              <div className="space-y-2">
                <Label>Selecionar Grupos ({selectedGroups.size} selecionados)</Label>
                <div className="max-h-48 overflow-auto border rounded-md p-2 space-y-1">
                  {groups.map((group) => (
                    <label
                      key={group.id}
                      className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedGroups.has(group.id)}
                        onChange={(e) => {
                          const newSet = new Set(selectedGroups)
                          if (e.target.checked) {
                            newSet.add(group.id)
                          } else {
                            newSet.delete(group.id)
                          }
                          setSelectedGroups(newSet)
                        }}
                      />
                      <span>{group.name}</span>
                      <Badge variant="outline" className="ml-auto">
                        {group.participantCount} membros
                      </Badge>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {formType === 'CONTACT_MESSAGE' && contacts.length > 0 && (
              <div className="space-y-2">
                <Label>Selecionar Contatos ({selectedContacts.size} selecionados)</Label>
                <div className="max-h-48 overflow-auto border rounded-md p-2 space-y-1">
                  {contacts.map((contact) => (
                    <label
                      key={contact.id}
                      className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedContacts.has(contact.id)}
                        onChange={(e) => {
                          const newSet = new Set(selectedContacts)
                          if (e.target.checked) {
                            newSet.add(contact.id)
                          } else {
                            newSet.delete(contact.id)
                          }
                          setSelectedContacts(newSet)
                        }}
                      />
                      <span>{contact.name || contact.pushName || contact.phoneNumber}</span>
                      <span className="text-muted-foreground ml-auto">+{contact.phoneNumber}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Cancelar
              </Button>
              <Button onClick={createCampaign} disabled={creating}>
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Campanha
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Campanhas */}
      {campaigns.length === 0 && !loading && !showCreate && (
        <Card>
          <CardContent className="py-8 text-center">
            <Send className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Nenhuma campanha criada</h3>
            <p className="text-muted-foreground">
              Crie sua primeira campanha para enviar mensagens em massa.
            </p>
            <Button className="mt-4" onClick={openCreateForm}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Campanha
            </Button>
          </CardContent>
        </Card>
      )}

      {campaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Suas Campanhas</CardTitle>
            <CardDescription>
              {campaigns.length} campanhas criadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center gap-4 rounded-lg border p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Send className="h-5 w-5 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{campaign.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {TYPE_LABELS[campaign.type]} • {campaign.totalTargets} alvos
                      {campaign.sentCount > 0 && ` • ${campaign.sentCount} enviadas`}
                    </p>
                  </div>

                  <Badge variant={STATUS_COLORS[campaign.status] as any}>
                    {STATUS_LABELS[campaign.status]}
                  </Badge>

                  <div className="flex gap-1">
                    {(campaign.status === 'DRAFT' || campaign.status === 'PAUSED') && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => controlCampaign(campaign.id, 'start')}
                        title="Iniciar"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    {campaign.status === 'RUNNING' && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => controlCampaign(campaign.id, 'pause')}
                          title="Pausar"
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => controlCampaign(campaign.id, 'stop')}
                          title="Parar"
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {(campaign.status === 'DRAFT' || campaign.status === 'COMPLETED' || campaign.status === 'CANCELLED') && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteCampaign(campaign.id)}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
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
