import { NextRequest, NextResponse } from 'next/server'
import { getEvolutionClient } from '@/lib/evolution/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const groupJid = searchParams.get('groupJid')

    if (!groupJid) {
      return NextResponse.json(
        { success: false, error: 'groupJid obrigatorio' },
        { status: 400 }
      )
    }

    const client = getEvolutionClient()
    const result = await client.getGroupParticipants(groupJid)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    // Extrair numeros dos participantes
    const contacts = result.data?.participants?.map((p) => ({
      jid: p.id,
      phoneNumber: p.id.replace('@s.whatsapp.net', ''),
      isAdmin: p.admin === 'admin' || p.admin === 'superadmin',
    })) || []

    return NextResponse.json({
      success: true,
      data: {
        groupJid,
        total: contacts.length,
        participants: contacts,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
