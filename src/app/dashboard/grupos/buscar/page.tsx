'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, ExternalLink, Plus, Loader2, Check, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { ScrapedGroup } from '@/types'

const SITES = [
  { id: 'gruposwhats', name: 'GruposWhats.app' },
  { id: 'grupos-online', name: 'Grupos-Online.com' },
  { id: 'whatsgrupos', name: 'WhatsGrupos.com' },
]

export default function BuscarGruposPage() {
  const router = useRouter()
  const [keyword, setKeyword] = useState('')
  const [site, setSite] = useState('gruposwhats')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [groups, setGroups] = useState<ScrapedGroup[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [savedCount, setSavedCount] = useState(0)

  const handleSearch = async () => {
    if (!keyword.trim()) return

    setLoading(true)
    setError(null)
    setGroups([])
    setSelected(new Set())
    setSavedCount(0)

    try {
      const res = await fetch('/api/scraper/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, site, limit: 50 }),
      })

      const data = await res.json()

      if (data.success) {
        setGroups(data.data.groups)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Erro ao buscar grupos')
    } finally {
      setLoading(false)
    }
  }

  const toggleSelect = (inviteCode: string) => {
    const newSelected = new Set(selected)
    if (newSelected.has(inviteCode)) {
      newSelected.delete(inviteCode)
    } else {
      newSelected.add(inviteCode)
    }
    setSelected(newSelected)
  }

  const selectAll = () => {
    if (selected.size === groups.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(groups.map(g => g.inviteCode)))
    }
  }

  const saveSelected = async () => {
    if (selected.size === 0) return

    setSaving(true)
    setError(null)

    try {
      const selectedGroups = groups.filter(g => selected.has(g.inviteCode))

      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groups: selectedGroups.map(g => ({
            name: g.name,
            inviteCode: g.inviteCode,
            inviteUrl: g.inviteUrl,
            source: 'SCRAPED',
            sourceUrl: g.sourceUrl,
            sourceKeyword: keyword,
            category: g.category,
          })),
        }),
      })

      const data = await res.json()

      if (data.success) {
        setSavedCount(data.data.created)
        // Remove saved groups from list
        const savedCodes = new Set(selectedGroups.map(g => g.inviteCode))
        setGroups(prev => prev.filter(g => !savedCodes.has(g.inviteCode)))
        setSelected(new Set())

        if (data.data.created > 0) {
          alert(`${data.data.created} grupos salvos com sucesso!\n${data.data.skipped} já existiam.`)
        } else {
          alert('Todos os grupos selecionados já existem no banco de dados.')
        }
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Erro ao salvar grupos')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/grupos">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Buscar Grupos</h1>
          <p className="text-muted-foreground">
            Encontre grupos de WhatsApp por palavra-chave
          </p>
        </div>
      </div>

      {/* Formulario de Busca */}
      <Card>
        <CardHeader>
          <CardTitle>Pesquisar</CardTitle>
          <CardDescription>
            Selecione um site e digite a palavra-chave
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <select
              value={site}
              onChange={(e) => setSite(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            >
              {SITES.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <Input
              placeholder="Ex: vendas, marketing, empreendedores..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />

            <Button onClick={handleSearch} disabled={loading || !keyword.trim()}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Buscar
            </Button>
          </div>

          {error && (
            <p className="mt-4 text-sm text-destructive">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Resultados */}
      {groups.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Resultados</CardTitle>
                <CardDescription>
                  {groups.length} grupos encontrados
                  {savedCount > 0 && ` • ${savedCount} salvos`}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  {selected.size === groups.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                </Button>
                {selected.size > 0 && (
                  <Button size="sm" onClick={saveSelected} disabled={saving}>
                    {saving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    Salvar {selected.size} Selecionados
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {groups.map((group) => (
                <div
                  key={group.inviteCode}
                  className={`flex items-center gap-4 rounded-lg border p-4 transition-colors cursor-pointer ${
                    selected.has(group.inviteCode)
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => toggleSelect(group.inviteCode)}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(group.inviteCode)}
                    onChange={() => {}}
                    className="h-4 w-4"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{group.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {group.inviteUrl}
                    </p>
                  </div>

                  <Badge variant="secondary">{group.category}</Badge>

                  <a
                    href={group.inviteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && groups.length === 0 && keyword && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhum grupo encontrado. Tente outra palavra-chave.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
