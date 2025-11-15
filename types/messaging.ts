export interface PersonalMessage {
  _id: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'mentor' | 'admin';
  receiverId: string;
  receiverName: string;
  receiverRole: 'student' | 'mentor' | 'admin';
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  userId: string;
  userName: string;
  userRole: 'student' | 'mentor' | 'admin';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface SendMessageData {
  receiverId: string;
  receiverName: string;
  receiverRole: 'student' | 'mentor' | 'admin';
  message: string;
}

export interface User {
  id: string;
  name: string;
  role: 'student' | 'mentor' | 'admin';
  email?: string;
}