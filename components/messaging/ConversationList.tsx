// components/messaging/ConversationList.tsx
'use client';

import { Conversation } from '@/types/messaging';

interface ConversationListProps {
  conversations: Conversation[];
  selectedUserId?: string;
  onSelectConversation: (user: { id: string; name: string; role: string }) => void;
  currentUser: any;
}

export default function ConversationList({
  conversations,
  selectedUserId,
  onSelectConversation,
  currentUser
}: ConversationListProps) {
  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      student: 'bg-blue-100 text-blue-800 border border-blue-200',
      mentor: 'bg-green-100 text-green-800 border border-green-200',
      admin: 'bg-purple-100 text-purple-800 border border-purple-200'
    };

    const labels = {
      student: '👨‍🎓 Student',
      mentor: '👨‍🏫 Mentor',
      admin: '👑 Admin'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[role as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {labels[role as keyof typeof labels] || role}
      </span>
    );
  };

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-1" />
            </svg>
          </div>
          <p className="text-sm">No conversations yet</p>
          <p className="text-xs mt-1">Start a new conversation to begin messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conversation) => (
        <div
          key={conversation.userId}
          className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
            selectedUserId === conversation.userId ? 'bg-blue-50 border-blue-200' : ''
          }`}
          onClick={() => onSelectConversation({
            id: conversation.userId,
            name: conversation.userName,
            role: conversation.userRole
          })}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {conversation.userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{conversation.userName}</h3>
                <div className="mt-1">
                  {getRoleBadge(conversation.userRole)}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-1">
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {formatTime(conversation.lastMessageTime)}
              </span>
              
              {conversation.unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                  {conversation.unreadCount}
                </span>
              )}
            </div>
          </div>
          
          {conversation.lastMessage && (
            <p className="text-sm text-gray-600 truncate mt-2">
              {conversation.lastMessage}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}