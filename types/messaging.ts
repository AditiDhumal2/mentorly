// types/messaging.ts
export interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'mentor' | 'admin';
  senderProfilePhoto?: string; // 🆕 ADD PROFILE PHOTO
  receiverId: string;
  receiverName: string;
  receiverRole: 'student' | 'mentor' | 'admin';
  receiverProfilePhoto?: string; // 🆕 ADD PROFILE PHOTO
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
  profilePhoto?: string; // 🆕 ADD PROFILE PHOTO
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
  role: 'student' | 'mentor';
  profilePhoto?: string; // 🆕 ADD PROFILE PHOTO
}