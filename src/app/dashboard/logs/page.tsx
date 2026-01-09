'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'

export default function LogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Logs</h1>
        <p className="text-muted-foreground">
          Acompanhe a atividade do sistema
        </p>
      </div>

      <Card>
        <CardContent className="py-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhum log registrado</h3>
          <p className="text-muted-foreground">
            As atividades do sistema aparecerão aqui.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
