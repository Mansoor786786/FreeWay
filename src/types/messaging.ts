export interface User {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
  status?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'voice' | 'emoji' | 'gif';
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  replyTo?: string;
  mediaUrl?: string;
  duration?: number; // for voice messages
  isForwarded?: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  isArchived: boolean;
  isMuted: boolean;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Call {
  id: string;
  callerId: string;
  receiverId: string;
  type: 'voice' | 'video';
  status: 'incoming' | 'outgoing' | 'missed' | 'answered' | 'ended';
  duration: number; // in seconds
  timestamp: Date;
  quality?: 'excellent' | 'good' | 'poor';
}

export interface CallState {
  isActive: boolean;
  isIncoming: boolean;
  currentCall?: Call;
  isMuted: boolean;
  isSpeakerOn: boolean;
  startTime?: Date;
}

export interface TypingIndicator {
  chatId: string;
  userId: string;
  isTyping: boolean;
  timestamp: Date;
}