export interface EvolutionConfig {
  baseUrl: string
  apiKey: string
  instanceName: string
}

export interface EvolutionResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export interface ConnectionState {
  instance: string
  state: 'open' | 'close' | 'connecting'
}

export interface QRCode {
  pairingCode?: string
  code?: string
  base64?: string
  count?: number
}

export interface GroupInfo {
  id: string
  subject: string
  subjectOwner?: string
  subjectTime?: number
  pictureUrl?: string
  size?: number
  creation?: number
  owner?: string
  desc?: string
  descId?: string
  restrict?: boolean
  announce?: boolean
  isCommunity?: boolean
  isCommunityAnnounce?: boolean
  participants?: GroupParticipant[]
}

export interface GroupParticipant {
  id: string
  admin?: 'admin' | 'superadmin' | null
  name?: string
  pushName?: string
}

export interface InviteInfo {
  groupId: string
  inviteCode: string
  inviteUrl: string
  groupName?: string
  groupDescription?: string
  groupPicture?: string
  groupSize?: number
}

export interface SendMessageOptions {
  delay?: number
  linkPreview?: boolean
  mentionsEveryOne?: boolean
}

export interface SendMediaOptions {
  mediatype: 'image' | 'video' | 'audio' | 'document'
  media: string
  caption?: string
  fileName?: string
}

export interface MessageResponse {
  key: {
    remoteJid: string
    fromMe: boolean
    id: string
  }
  message: object
  messageTimestamp: string
  status: string
}
