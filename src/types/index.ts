// Re-export Prisma types
export type {
  Instance,
  Group,
  Contact,
  Campaign,
  CampaignGroup,
  CampaignContact,
  Message,
  QueueItem,
  Log,
  Setting,
} from '@prisma/client'

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Dashboard stats
export interface DashboardStats {
  totalGroups: number
  joinedGroups: number
  totalContacts: number
  activeCampaigns: number
  messagesSent: number
  messagesDelivered: number
  queuePending: number
  connectionStatus: 'connected' | 'disconnected' | 'connecting'
}

// Scraped group from external sites
export interface ScrapedGroup {
  name: string
  inviteUrl: string
  inviteCode: string
  category?: string
  description?: string
  sourceUrl?: string
}

// Queue action types
export type QueueAction =
  | 'JOIN_GROUP'
  | 'SEND_GROUP_MESSAGE'
  | 'SEND_CONTACT_MESSAGE'
  | 'EXTRACT_CONTACTS'
  | 'SYNC_GROUPS'

// Campaign types
export type CampaignType =
  | 'GROUP_MESSAGE'
  | 'CONTACT_MESSAGE'
  | 'GROUP_JOIN'

// Status types
export type InstanceStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'BANNED'
export type GroupStatus = 'PENDING' | 'JOINING' | 'JOINED' | 'LEFT' | 'FAILED' | 'BLOCKED'
export type GroupSource = 'MANUAL' | 'SCRAPED' | 'IMPORTED' | 'SYNCED'
export type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'FAILED'
export type MessageStatus = 'PENDING' | 'QUEUED' | 'SENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED'
export type QueueStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
