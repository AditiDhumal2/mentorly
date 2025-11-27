// components/Messaging.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  sendMessage, 
  getConversations, 
  getMessages, 
  getUsersForMessaging, 
  getUnreadMessageCount
} from '@/actions/messaging-actions';
import type { Conversation } from '@/types/messaging';

interface MessagingProps {
  currentUser: {
    id: string;
    name: string;
    role: 'student' | 'mentor';
  };
}

export default function Messaging({ currentUser }: MessagingProps) {
  const [activeTab, setActiveTab] = useState<'conversations' | 'new'>('conversations');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
    loadUnreadCount();
  }, [currentUser.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      const result = await getConversations(currentUser.id, currentUser.role);
      if (result.success && result.conversations) {
        setConversations(result.conversations);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const result = await getUnreadMessageCount(currentUser.id);
      if (result.success && result.count !== undefined) {
        setUnreadCount(result.count);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const loadMessages = async (user: any) => {
    setSelectedUser(user);
    setLoading(true);
    try {
      const result = await getMessages(currentUser.id, user.id);
      if (result.success && result.messages) {
        setMessages(result.messages);
      }
      setActiveTab('conversations');
      
      // Refresh conversations to update unread counts
      await loadConversations();
      await loadUnreadCount();
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const result = await sendMessage(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        {
          receiverId: selectedUser.id,
          receiverName: selectedUser.name,
          receiverRole: selectedUser.role,
          content: newMessage.trim()
        }
      );

      if (result.success) {
        setNewMessage('');
        // Reload messages to show the new one
        await loadMessages(selectedUser);
        await loadConversations();
      } else {
        console.error('Failed to send message:', result.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSearchUsers = async (search: string) => {
    setSearchTerm(search);
    if (search.length > 1) {
      try {
        const result = await getUsersForMessaging(search, currentUser.id);
        if (result.success && result.users) {
          setUsers(result.users);
        }
      } catch (error) {
        console.error('Error searching users:', error);
      }
    } else {
      setUsers([]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startNewConversation = (user: any) => {
    setSelectedUser(user);
    setMessages([]);
    setSearchTerm('');
    setUsers([]);
    setActiveTab('conversations');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 h-[600px] flex">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('conversations')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg ${
                activeTab === 'conversations'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Chats
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg ${
                activeTab === 'new'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              New
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'conversations' ? (
            /* Conversations List */
            <div className="p-2">
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No conversations yet
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.userId}
                    onClick={() => startNewConversation({
                      id: conv.userId,
                      name: conv.userName,
                      role: conv.userRole
                    })}
                    className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 mb-2 ${
                      selectedUser?.id === conv.userId ? 'bg-blue-50 border border-blue-200' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        {conv.profilePhoto ? (
                          <img 
                            src={conv.profilePhoto} 
                            alt={conv.userName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                            conv.userRole === 'mentor' ? 'bg-purple-500' : 'bg-green-500'
                          }`}>
                            {conv.userName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">
                            {conv.userName}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">
                            {conv.userRole}
                          </div>
                        </div>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-5 h-5 flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1 truncate">
                      {conv.lastMessage}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {conv.lastMessageTime ? new Date(conv.lastMessageTime).toLocaleDateString() : ''}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* New Conversation */
            <div className="p-4">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => handleSearchUsers(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              
              <div className="mt-4 space-y-2">
                {users.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => startNewConversation({
                      id: user._id,
                      name: user.name,
                      role: user.role
                    })}
                    className="p-3 rounded-lg cursor-pointer hover:bg-gray-50 border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      {user.profilePhoto ? (
                        <img 
                          src={user.profilePhoto} 
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${
                          user.role === 'mentor' ? 'bg-purple-500' : 'bg-green-500'
                        }`}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {user.role}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {searchTerm.length > 1 && users.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No users found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                  selectedUser.role === 'mentor' ? 'bg-purple-500' : 'bg-green-500'
                }`}>
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {selectedUser.name}
                  </div>
                  <div className="text-sm text-gray-500 capitalize">
                    {selectedUser.role}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${message.isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.isOwnMessage
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <div className="text-sm">{message.content}</div>
                      <div
                        className={`text-xs mt-1 ${
                          message.isOwnMessage ? 'text-blue-200' : 'text-gray-500'
                        }`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          /* No Conversation Selected */
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation or start a new one
          </div>
        )}
      </div>
    </div>
  );
}