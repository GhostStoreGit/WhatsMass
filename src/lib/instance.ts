import prisma from './prisma'

const INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME || 'whatsapp-automation'
const API_KEY = process.env.EVOLUTION_API_KEY || ''
const BASE_URL = process.env.EVOLUTION_API_URL || ''

export async function getDefaultInstance() {
  let instance = await prisma.instance.findUnique({
    where: { name: INSTANCE_NAME },
  })

  if (!instance) {
    instance = await prisma.instance.create({
      data: {
        name: INSTANCE_NAME,
        apiKey: API_KEY,
        baseUrl: BASE_URL,
        status: 'DISCONNECTED',
      },
    })
  }

  return instance
}

export async function updateInstanceStatus(status: string, phoneNumber?: string) {
  return prisma.instance.update({
    where: { name: INSTANCE_NAME },
    data: {
      status,
      phoneNumber: phoneNumber || undefined,
      lastSync: new Date(),
    },
  })
}
