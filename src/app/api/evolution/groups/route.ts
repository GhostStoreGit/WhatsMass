import { NextRequest, NextResponse } from 'next/server'
import { getEvolutionClient } from '@/lib/evolution/client'
import { prisma } from '@/lib/db/prisma'

// GET - Listar todos os grupos do WhatsApp
export async function GET() {
  try {
    const client = getEvolutionClient()
    const result = await client.fetchAllGroups(true)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

// POST - Entrar em um grupo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { inviteCode, inviteUrl } = body

    const code = inviteCode || (inviteUrl ? inviteUrl.split('/').pop() : null)

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'inviteCode ou inviteUrl obrigatorio' },
        { status: 400 }
      )
    }

    const client = getEvolutionClient()
    const result = await client.joinGroup(code)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
