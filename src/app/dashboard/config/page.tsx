'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Settings, Save } from 'lucide-react'

export default function ConfigPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuracoes</h1>
        <p className="text-muted-foreground">
          Configure o comportamento do sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rate Limiting</CardTitle>
          <CardDescription>
            Configure os limites para evitar bloqueio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Mensagens por hora</label>
              <Input type="number" defaultValue={30} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Mensagens por dia</label>
              <Input type="number" defaultValue={200} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Delay minimo (segundos)</label>
              <Input type="number" defaultValue={30} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Delay maximo (segundos)</label>
              <Input type="number" defaultValue={90} className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Horario de Operacao</CardTitle>
          <CardDescription>
            Define quando o sistema pode enviar mensagens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Inicio</label>
              <Input type="time" defaultValue="08:00" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Fim</label>
              <Input type="time" defaultValue="22:00" className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button>
        <Save className="mr-2 h-4 w-4" />
        Salvar Configuracoes
      </Button>
    </div>
  )
}
