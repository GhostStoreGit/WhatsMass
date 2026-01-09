import { NextResponse } from 'next/server'
import { getEvolutionClient } from '@/lib/evolution/client'

export async function GET() {
  try {
    const client = getEvolutionClient()
    const result = await client.getConnectionState()

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        instance: result.data?.instance,
        state: result.data?.state,
        connected: result.data?.state === 'open',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
