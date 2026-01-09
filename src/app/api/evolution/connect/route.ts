import { NextResponse } from 'next/server'
import { getEvolutionClient } from '@/lib/evolution/client'

export async function GET() {
  try {
    const client = getEvolutionClient()

    // Tenta conectar e obter QR Code
    const result = await client.connectInstance()

    if (!result.success) {
      // Se falhar, pode ser que a instancia nao existe, tenta criar
      const createResult = await client.createInstance({ qrcode: true })

      if (!createResult.success) {
        return NextResponse.json(
          { success: false, error: createResult.error || 'Falha ao criar instancia' },
          { status: 400 }
        )
      }

      // Tenta conectar novamente
      const retryResult = await client.connectInstance()
      if (!retryResult.success) {
        return NextResponse.json(
          { success: false, error: retryResult.error },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          qrCode: retryResult.data?.base64,
          pairingCode: retryResult.data?.pairingCode,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        qrCode: result.data?.base64,
        pairingCode: result.data?.pairingCode,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const client = getEvolutionClient()
    const result = await client.logoutInstance()

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
