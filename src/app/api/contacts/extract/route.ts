import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getEvolutionClient } from '@/lib/evolution/client'

// POST - Extract contacts from a group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { groupId, jid } = body

    if (!groupId && !jid) {
      return NextResponse.json(
        { success: false, error: 'groupId ou jid obrigatório' },
        { status: 400 }
      )
    }

    let group = null
    let groupJid = jid

    // If groupId provided, get from database
    if (groupId) {
      group = await prisma.group.findUnique({
        where: { id: groupId },
      })

      if (!group) {
        return NextResponse.json(
          { success: false, error: 'Grupo não encontrado' },
          { status: 404 }
        )
      }

      groupJid = group.jid
    }

    if (!groupJid) {
      return NextResponse.json(
        { success: false, error: 'JID do grupo não encontrado. O grupo precisa estar conectado.' },
        { status: 400 }
      )
    }

    // Call Evolution API to get participants
    const client = getEvolutionClient()
    const result = await client.getGroupParticipants(groupJid)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    const participants = result.data?.participants || []
    const created = []
    const updated = []
    const skipped = []

    for (const participant of participants) {
      // Extract phone number from JID (format: 5511999999999@s.whatsapp.net)
      const phoneNumber = participant.id?.replace('@s.whatsapp.net', '') || ''

      if (!phoneNumber || phoneNumber.includes('-')) {
        // Skip group IDs
        skipped.push(participant.id)
        continue
      }

      // Check if exists
      const existing = await prisma.contact.findUnique({
        where: { phoneNumber },
      })

      const participantName = participant.name || participant.pushName

      if (existing) {
        // Update pushName if different
        if (participantName && participantName !== existing.pushName) {
          const updatedContact = await prisma.contact.update({
            where: { phoneNumber },
            data: { pushName: participantName },
          })
          updated.push(updatedContact)
        } else {
          skipped.push(phoneNumber)
        }
        continue
      }

      const contact = await prisma.contact.create({
        data: {
          phoneNumber,
          jid: participant.id,
          pushName: participantName,
          sourceGroupId: group?.id,
        },
      })
      created.push(contact)
    }

    // Update group participant count
    if (group) {
      await prisma.group.update({
        where: { id: group.id },
        data: { participantCount: participants.length },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        total: participants.length,
        created: created.length,
        updated: updated.length,
        skipped: skipped.length,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
