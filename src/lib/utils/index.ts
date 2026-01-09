import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function randomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, '')
  if (clean.length === 13) {
    return `+${clean.slice(0, 2)} (${clean.slice(2, 4)}) ${clean.slice(4, 9)}-${clean.slice(9)}`
  }
  if (clean.length === 12) {
    return `+${clean.slice(0, 2)} (${clean.slice(2, 4)}) ${clean.slice(4, 8)}-${clean.slice(8)}`
  }
  return phone
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('pt-BR').format(num)
}

export function extractInviteCode(url: string): string | null {
  const match = url.match(/chat\.whatsapp\.com\/([A-Za-z0-9]{20,24})/)
  return match ? match[1] : null
}

export function isWithinSchedule(start: string, end: string): boolean {
  const now = new Date()
  const hour = now.getHours()
  const minute = now.getMinutes()
  const currentTime = hour * 60 + minute

  const [startHour, startMinute] = start.split(':').map(Number)
  const [endHour, endMinute] = end.split(':').map(Number)

  const startTime = startHour * 60 + startMinute
  const endTime = endHour * 60 + endMinute

  return currentTime >= startTime && currentTime < endTime
}
