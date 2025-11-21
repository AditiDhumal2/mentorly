// types/messaging.ts
export interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'mentor' | 'admin';
  receiverId: string;
  receiverName: string;
  receiverRole: 'student' | 'mentor' | 'admin';
  content: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  userId: string;
  userName: string;
  userRole: 'student' | 'mentor' | 'admin';
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isOnline?: boolean;
}

export interface SendMessageData {
  receiverId: string;
  receiverName: string;
  receiverRole: 'student' | 'mentor' | 'admin';
  content: string;
}

export interface UserSearchResult {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'mentor' | 'admin';
}